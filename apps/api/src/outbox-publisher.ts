import amqplib from 'amqplib';
import { Pool } from 'pg';
import pino from 'pino';
import { exchanges } from '@pkg/mq';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

export async function runPublisher(): Promise<void> {
  const conn = await amqplib.connect(process.env.RABBIT_URL!);
  const ch = await conn.createChannel();
  await ch.assertExchange(exchanges.events.name, 'topic', { durable: true });

  setInterval(async () => {
    try {
      const { rows } = await pool.query(
        `SELECT id, payload FROM outbox WHERE published = FALSE ORDER BY id LIMIT 100`
      );
      for (const row of rows) {
        const payload = row.payload;
        const routingKey = payload.name || 'event.unknown';
        ch.publish(
          exchanges.events.name,
          routingKey,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true }
        );
        await pool.query(`UPDATE outbox SET published = TRUE WHERE id = $1`, [row.id]);
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

