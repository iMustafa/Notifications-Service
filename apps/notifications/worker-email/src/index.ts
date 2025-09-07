import amqplib from 'amqplib';
import { createClient } from 'redis';
import pino from 'pino';
import type { DeliveryJob } from '@notifications/core';
import { renderEmail } from '@notifications/templates';
import { initDb } from '@notifications/db';
import { Template, DeliveryStatus, Notification } from '@notifications/db';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const redis = createClient({ url: process.env.REDIS_URL });

async function sendEmail(_providerCfg: any, _to: string, _subject: string, _html: string): Promise<string> {
  console.log('sending email', _to, _subject, _html);
  return `mock-${Date.now()}`;
}

async function run(): Promise<void> {
  await redis.connect();
  await initDb();
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
        const t = await Template.findOne({
          where: {
            key: job.plan.templateKey,
            channel: 'email',
            locale: job.recipients[0]?.locale ?? 'en'
          },
          order: [['version', 'DESC']]
        });

        if (!t) {
          logger.warn({ template: job.plan.templateKey }, 'template not found');
          ch.nack(msg, false, false);
          return;
        }

        const { subject, body } = t;
        const html = renderEmail(body, job.data);
        const to = job.recipients[0]?.email;
        if (!to) {
          logger.warn({ job }, 'no email address found');
          ch.ack(msg);
          return;
        }

        if (!job.recipients[0]?.userId) {
          logger.warn({ job }, 'no user id found');
          ch.ack(msg);
          return;
        }

        const providerMsgId = await sendEmail({}, to, subject ?? '', html);

        await Notification.create({
          id: job.jobId,
          tenant_id: job.tenantId,
          user_id: job.recipients[0]?.userId,
          channel: 'email',
          template_key: job.plan.templateKey,
          template_version: t.version,
          payload: job.data,
          status: 'sent'
        });

        await DeliveryStatus.create({
          notification_id: job.jobId,
          provider: 'email',
          status: 'sent',
          meta: { providerMsgId }
        });

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

