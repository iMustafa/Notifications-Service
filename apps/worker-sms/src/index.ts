import amqplib from 'amqplib';
import { createClient } from 'redis';
import pino from 'pino';
import type { DeliveryJob } from '@pkg/core';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const redis = createClient({ url: process.env.REDIS_URL });

async function run(): Promise<void> {
  await redis.connect();
  const conn = await amqplib.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue('jobs.sms.q', { durable: true });
  await ch.prefetch(20);

  await ch.consume(
    'jobs.sms.q',
    async msg => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString()) as DeliveryJob;
      try {
        logger.info({ to: job.recipients[0]?.phone }, 'SMS send stub');
        ch.ack(msg);
      } catch (err) {
        logger.error({ err }, 'worker-sms failed');
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

run().catch(err => {
  logger.error({ err }, 'worker-sms crashed');
  process.exit(1);
});

