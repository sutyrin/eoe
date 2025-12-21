import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { createInitialState, type GameState } from '../../packages/game-core/src/steppy';

const getClientId = (req: VercelRequest): string | null => {
  const header = req.headers['x-client-id'];
  if (!header) {
    return null;
  }
  return Array.isArray(header) ? header[0] : header;
};

const getKey = (clientId: string) => `steppy:${clientId}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = getClientId(req);
  if (!clientId) {
    res.status(400).json({ status: 'error', message: 'x-client-id is required' });
    return;
  }

  if (req.method === 'GET') {
    const raw = await kv.get<string>(getKey(clientId));
    const state = raw ? (JSON.parse(raw) as GameState) : createInitialState();
    if (!raw) {
      await kv.set(getKey(clientId), JSON.stringify(state));
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
    const raw = await kv.get<string>(getKey(clientId));
    const current = raw ? (JSON.parse(raw) as GameState) : createInitialState();
    const next = incoming.tick >= current.tick ? incoming : current;
    await kv.set(getKey(clientId), JSON.stringify(next));
    res.json({ state: next });
    return;
  }

  res.status(405).json({ status: 'error', message: 'Method not allowed' });
}
