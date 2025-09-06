import { createClient, RedisClientType } from 'redis';

export function createRedisClient(url: string | undefined): RedisClientType {
  const client = createClient({ url });
  return client;
}

export async function setIdempotency(client: RedisClientType, key: string, ms: number): Promise<boolean> {
  const res = await client.set(key, '1', { NX: true, PX: ms });
  return Boolean(res);
}

export async function incrementDaily(client: RedisClientType, bucket: string, identity: string, limit: number): Promise<boolean> {
  const k = `rl:${bucket}:${identity}:${new Date().toISOString().slice(0, 10)}`;
  const cur = await client.incr(k);
  if (cur === 1) await client.expire(k, 86400);
  return cur <= limit;
}

