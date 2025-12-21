import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type RedisClientType } from 'redis';
import { createInitialState, type GameState } from '../src/game-core/steppy';

const getClientId = (req: VercelRequest): string | null => {
  const header = req.headers['x-client-id'];
  if (!header) {
    return null;
  }
  return Array.isArray(header) ? header[0] : header;
};

const getKey = (clientId: string) => `steppy:${clientId}`;

let redisClient: RedisClientType | null = null;
let redisReady: Promise<RedisClientType> | null = null;

const getRedis = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set');
  }
  if (!redisReady) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (error) => {
      console.error('Redis error', error);
    });
    redisReady = redisClient.connect().then(() => redisClient as RedisClientType);
  }
  return redisReady;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = getClientId(req);
  if (!clientId) {
    res.status(400).json({ status: 'error', message: 'x-client-id is required' });
    return;
  }

  if (req.method === 'GET') {
    const redis = await getRedis();
    const raw = await redis.get(getKey(clientId));
    const state = raw ? (JSON.parse(raw) as GameState) : createInitialState();
    if (!raw) {
      await redis.set(getKey(clientId), JSON.stringify(state));
    }
    res.json({ state });
    return;
  }

  if (req.method === 'POST') {
    const incoming = req.body?.state as GameState | undefined;
    if (!incoming) {
      res.status(400).json({ status: 'error', message: 'state is required' });
      return;
    }
    const redis = await getRedis();
    const raw = await redis.get(getKey(clientId));
    const current = raw ? (JSON.parse(raw) as GameState) : createInitialState();
    const next = incoming.tick >= current.tick ? incoming : current;
    await redis.set(getKey(clientId), JSON.stringify(next));
    res.json({ state: next });
    return;
  }

  res.status(405).json({ status: 'error', message: 'Method not allowed' });
}
