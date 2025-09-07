import amqplib from 'amqplib';
import { Pool } from 'pg';
import { createClient } from 'redis';
import pino from 'pino';
import type { DeliveryJob } from '@notifications/core/src/index.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
const redis = createClient({ url: process.env.REDIS_URL });

async function run(): Promise<void> {
  await redis.connect();
  const conn = await amqplib.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue('jobs.inapp.q', { durable: true });
  await ch.prefetch(50);

  await ch.consume(
    'jobs.inapp.q',
    async msg => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString()) as DeliveryJob;
      try {
        const userId = job.recipients[0]?.userId!;
        const versionRes = await pool.query(
          `SELECT version FROM templates WHERE key=$1 AND channel='inapp' ORDER BY version DESC LIMIT 1`,
          [job.plan.templateKey]
        );
        const version = versionRes.rows[0]?.version ?? 1;

        await pool.query(
          `INSERT INTO notifications(id, tenant_id, user_id, channel, template_key, template_version, payload, status)
           VALUES ($1,$2,$3,'inapp',$4,$5,$6,'delivered')`,
          [job.jobId, job.tenantId, userId, job.plan.templateKey, version, job.data]
        );
        await redis.publish(`inapp:${userId}`, JSON.stringify({ id: job.jobId, ...job.data }));
        ch.ack(msg);
      } catch (err) {
        logger.error({ err }, 'worker-inapp failed');
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

run().catch(err => {
  logger.error({ err }, 'worker-inapp crashed');
  process.exit(1);
});

