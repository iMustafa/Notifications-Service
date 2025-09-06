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
  await ch.assertQueue('jobs.push.q', { durable: true });
  await ch.prefetch(20);

  await ch.consume(
    'jobs.push.q',
    async msg => {
      if (!msg) return;
      const job = JSON.parse(msg.content.toString()) as DeliveryJob;
      try {
        logger.info({ tokens: job.recipients[0]?.pushTokens }, 'Push send stub');
        ch.ack(msg);
      } catch (err) {
        logger.error({ err }, 'worker-push failed');
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

run().catch(err => {
  logger.error({ err }, 'worker-push crashed');
  process.exit(1);
});

