import type { Channel } from 'amqplib';

export const exchanges = {
  events: { name: 'events.exchange', type: 'topic' as const },
  jobs: { name: 'jobs.exchange', type: 'direct' as const },
  status: { name: 'status.exchange', type: 'fanout' as const },
};

export async function setup(channel: Channel): Promise<void> {
  await channel.assertExchange(exchanges.events.name, exchanges.events.type, { durable: true });
  await channel.assertExchange(exchanges.jobs.name, exchanges.jobs.type, { durable: true });
  await channel.assertExchange(exchanges.status.name, exchanges.status.type, { durable: true });

  await channel.assertQueue('orchestrator.events.q', {
    durable: true,
  });
  await channel.bindQueue('orchestrator.events.q', exchanges.events.name, '#');
  await channel.assertQueue('orchestrator.events.dlq', { durable: true });

  for (const ch of ['email', 'sms', 'push', 'inapp'] as const) {
    await channel.assertQueue(`jobs.${ch}.q`, { durable: true });
    await channel.bindQueue(`jobs.${ch}.q`, exchanges.jobs.name, ch);
    await channel.assertQueue(`jobs.${ch}.dlq`, { durable: true });
  }
}
