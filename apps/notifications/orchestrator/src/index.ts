import { exchanges, setup } from '@notifications/mq';
import type { DomainEvent, DeliveryJob, Channel } from '@notifications/core';
import { getEventDefinition } from '@notifications/core';
import { initDb, User, ChannelPreference, } from '@notifications/db';

import amqplib from 'amqplib';
import { createClient } from 'redis';
import crypto from 'crypto';
import { Op } from 'sequelize';

const redis = createClient({ url: process.env.REDIS_URL });

async function rateLimit(bucket: string, key: string, limitPerDay = 2): Promise<boolean> {
  const k = `rl:${bucket}:${key}:${new Date().toISOString().slice(0, 10)}`;
  const cur = await redis.incr(k);
  if (cur === 1) await redis.expire(k, 86400);
  return cur <= limitPerDay;
}

async function run(): Promise<void> {
  await initDb();
  await redis.connect();
  const conn = await amqplib.connect(process.env.RABBIT_URL!);

  const ch = await conn.createChannel();
  await setup(ch);
  await ch.prefetch(50);

  await ch.consume(
    'orchestrator.events.q',
    async msg => {
      if (!msg) return;
      const event = JSON.parse(msg.content.toString()) as DomainEvent;

      try {
        const userIds = event.targets.userIds ?? [];
        const users = await User.findAll({
          where: { id: { [Op.in]: userIds } },
          attributes: ['id', 'email', 'phone', 'locale', 'timezone', 'tenant_id']
        });

        const def = getEventDefinition(event.name);
        const basePlan = def?.defaultPlan ?? { primary: 'inapp', templateKey: event.name };
        const overrideChannel = (event).overrides?.channelOverride as Channel | undefined;
        const plan = overrideChannel ? { ...basePlan, primary: overrideChannel, fallbacks: [] } : basePlan;

        for (const u of users as any[]) {
          const pref = await ChannelPreference.findOne({ where: { tenant_id: u.tenant_id, user_id: u.id, channel: plan.primary }, attributes: ['enabled'] });
          const enabled = (pref as any)?.enabled ?? true;

          console.log({
            enabled,
            overrideChannel
          });

          if (!enabled) continue;

          if (plan.constraints?.rateLimitBucket) {
            const ok = await rateLimit(plan.constraints.rateLimitBucket, `${u.id}:${plan.primary}`);
            if (!ok) continue;
          }

          const job: DeliveryJob = {
            jobId: crypto.randomUUID(),
            eventId: event.id,
            tenantId: event.tenantId,
            channel: plan.primary,
            plan: { ...plan },
            recipients: [
              {
                userId: u.id,
                email: u.email,
                phone: u.phone,
                locale: u.locale,
                timezone: u.timezone,
              },
            ],
            data: event.payload,
            priority: event.priority ?? 'normal',
            traceId: event.traceId ?? event.id,
          };

          ch.publish(exchanges.jobs.name, plan.primary, Buffer.from(JSON.stringify(job)), {
            persistent: true,
            priority: job.priority === 'high' ? 8 : 4,
          });
        }

        ch.ack(msg);
      } catch (err) {
        ch.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

