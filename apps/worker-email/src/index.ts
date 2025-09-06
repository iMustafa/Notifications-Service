import amqplib from 'amqplib';
import { Pool } from 'pg';
import { createClient } from 'redis';
import pino from 'pino';
import type { DeliveryJob } from '@pkg/core';
import { renderEmail } from '@pkg/templates';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const redis = createClient({ url: process.env.REDIS_URL });

async function sendEmail(_providerCfg: any, _to: string, _subject: string, _html: string): Promise<string> {
  console.log('sending email', _to, _subject, _html);
  return `mock-${Date.now()}`;
}

async function run(): Promise<void> {
  await redis.connect();
  const conn = await amqplib.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue('jobs.email.q', { durable: true });
  await ch.prefetch(50);

  await ch.consume(
    'jobs.email.q',
    async msg => {
      if (!msg) {
        logger.warn('no message found');
        return;
      };
      const job = JSON.parse(msg.content.toString()) as DeliveryJob;

      try {
        const idemKey = `idem:${job.jobId}`;
        const set = await redis.set(idemKey, '1', { NX: true, PX: 6 * 60 * 60 * 1000 });
        if (!set) {
          logger.warn({ idemKey }, 'idem key already exists');
          ch.ack(msg);
          return;
        }

        logger.info({ job }, 'fetching template');
        const t = await pool.query(
          `SELECT * FROM templates WHERE key=$1 AND channel='email' AND locale=$2 ORDER BY version DESC LIMIT 1`,
          [job.plan.templateKey, job.recipients[0]?.locale ?? 'en']
        );

        if (t.rowCount === 0) {
          logger.warn({ template: job.plan.templateKey }, 'template not found');
          ch.nack(msg, false, false);
          return;
        }

        const { subject, body } = t.rows[0];
        const html = renderEmail(body, job.data);
        const to = job.recipients[0]?.email;
        if (!to) {
          logger.warn({ job }, 'no email address found');
          ch.ack(msg);
          return;
        }

        const providerMsgId = await sendEmail({}, to, subject ?? '', html);

        await pool.query(
          `
          WITH ins AS (
            INSERT INTO notifications(id, tenant_id, user_id, channel, template_key, template_version, payload, status)
            VALUES ($1,$2,$3,'email',$4,$5,$6,'sent') RETURNING id
          )
          INSERT INTO delivery_status(notification_id, provider, status, meta)
          SELECT id, 'email', 'sent', jsonb_build_object('providerMsgId', $7::text) FROM ins
        `,
          [
            job.jobId,
            job.tenantId,
            job.recipients[0]?.userId,
            job.plan.templateKey,
            t.rows[0].version,
            job.data,
            providerMsgId,
          ]
        );

        logger.info({ job, providerMsgId }, 'email sent');

        ch.ack(msg);
      } catch (err) {
        logger.error({ err }, 'worker-email failed');
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

run().catch(err => {
  logger.error({ err }, 'worker-email crashed');
  process.exit(1);
});

