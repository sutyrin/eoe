import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type RedisClientType } from 'redis';

// Keep these in sync with src/game-core/steppy.ts
const STEPPY_VERSION = '0.2-garden';
const STEPPY_COLUMNS = 5;

type PlayerState = {
  x: number;
  y: number;
};

type GameState = {
  version: string;
  status: 'ready' | 'running' | 'ended';
  tick: number;
  player: PlayerState;
  map: Record<string, number[]>;
  seed: number;
};

const createInitialState = (): GameState => ({
  version: STEPPY_VERSION,
  status: 'running',
  tick: 0,
  player: { x: Math.floor(STEPPY_COLUMNS / 2), y: 0 },
  map: {},
  seed: Date.now(),
});

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
    console.log('Redis init', { hasUrl: Boolean(process.env.REDIS_URL) });
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (error: unknown) => {
      console.error('Redis error', error);
    });
    redisReady = redisClient.connect().then(() => redisClient as RedisClientType);
  }
  return redisReady;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const clientId = getClientId(req);
    if (!clientId) {
      res.status(400).json({ status: 'error', message: 'x-client-id is required' });
      return;
    }

    if (req.method === 'GET') {
      const redis = await getRedis();
      const raw = await redis.get(getKey(clientId));
      const state = raw ? (JSON.parse(raw) as GameState) : createInitialState();
      
      // Auto-migrate or Reset if version mismatch?
      // For now, let's just return what we have. Client handles reset.
      // But if we generated a fresh state (createInitialState), it is correct.
      
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
  } catch (error) {
    console.error('State API failed', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
    });
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
}