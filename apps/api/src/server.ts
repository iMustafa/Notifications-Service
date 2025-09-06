import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import { initDb, Outbox, Notification } from '@pkg/db';
import crypto from 'crypto';
import pino from 'pino';
import { EventKey, getEventDefinition } from '@pkg/core';
import './outbox-publisher.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(express.json());
app.use(cors());

await initDb();

const eventSchema = z.object({
  id: z.string().uuid().optional().default(() => crypto.randomUUID()),
  name: z.string().min(1),
  occurredAt: z.string().datetime(),
  tenantId: z.string().min(1),
  targets: z.object({ userIds: z.array(z.string()).optional(), emails: z.array(z.string()).optional(), phones: z.array(z.string()).optional() }),
  payload: z.record(z.any()),
  dedupeKey: z.string().optional(),
  priority: z.enum(['high', 'normal', 'low']).optional().default('normal'),
  traceId: z.string().optional(),
  overrides: z.object({ channelOverride: z.enum(['email', 'sms', 'push', 'inapp']).optional() }).optional()
});

app.post('/events', async (req: Request, res: Response) => {
  try {
    const parsed = eventSchema.parse(req.body);
    const def = getEventDefinition(parsed.name as EventKey);
    if (!def) {
      return res.status(400).json({ error: 'unknown event' });
    }
    await Outbox.create({ aggregate_type: 'event', aggregate_id: parsed.id, payload: parsed, published: false });
    res.status(202).json({ ok: true, id: parsed.id });
  } catch (err) {
    logger.error({ err }, 'failed to ingest event');
    res.status(400).json({ error: 'invalid request' });
  }
});

app.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = String(req.query.userId || '').trim();
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const rows = await Notification.findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']], limit: 50 });
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch notifications' });
  }
});

const port = Number(process.env.APP_PORT || 8080);
app.listen(port, () => logger.info({ port }, 'api listening'));

