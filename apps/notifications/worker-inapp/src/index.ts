import type { DeliveryJob } from '@notifications/core';
import { initDb, Template, Notification } from '@notifications/db';
import amqplib from 'amqplib';
import { createClient } from 'redis';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const redis = createClient({ url: process.env.REDIS_URL });

async function run(): Promise<void> {
  await initDb();
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
        const t = await Template.findOne({
          where: {
            key: job.plan.templateKey,
            channel: 'inapp'
          },
          order: [['version', 'DESC']]
        });
        const version = t?.version ?? 1;

        await Notification.create({
          id: job.jobId,
          tenant_id: job.tenantId,
          user_id: userId,
          channel: 'inapp',
          template_key: job.plan.templateKey,
          template_version: version,
          payload: job.data,
          status: 'delivered'
        });

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

