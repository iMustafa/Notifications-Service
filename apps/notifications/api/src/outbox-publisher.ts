import amqplib from 'amqplib';
import { initDb, Outbox } from '@notifications/db';
import pino from 'pino';
import { exchanges } from '@notifications/mq';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
await initDb();

export async function runPublisher(): Promise<void> {
  const conn = await amqplib.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertExchange(exchanges.events.name, 'topic', { durable: true });

  setInterval(async () => {
    try {
      const rows = await Outbox.findAll({ where: { published: false }, order: [['id','ASC']], limit: 100 });
      for (const row of rows) {
        const payload = row.get('payload') as any;
        const routingKey = payload.name || 'event.unknown';
        ch.publish(
          exchanges.events.name,
          routingKey,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true }
        );
        await row.update({ published: true });
      }
    } catch (err) {
      logger.error({ err }, 'outbox publisher tick failed');
    }
  }, 500);
}

if (process.env.RUN_PUBLISHER === '1') {
  runPublisher().catch(err => {
    logger.error({ err }, 'publisher failed');
    process.exit(1);
  });
}

