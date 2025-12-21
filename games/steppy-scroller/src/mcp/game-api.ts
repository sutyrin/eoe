export type Action = {
  id: string;
  label: string;
  enabled: boolean;
};

export type GameState = {
  version: string;
  status: 'ready' | 'running' | 'ended';
  tick: number;
  player: {
    x: number;
    y: number;
  };
  actions: Action[];
  meta?: Record<string, unknown>;
};

export type GameApi = {
  getState: () => GameState;
  getActions: () => Action[];
  act: (actionId: string, payload?: unknown) => GameState;
};

export type RegisterOptions = {
  log?: boolean;
  tag?: string;
};

const defaultTag = '[mcp]';

const noopLog = () => undefined;

const getLogger = (enabled: boolean, tag: string) =>
  enabled
    ? (event: string, data?: unknown) => {
        if (data === undefined) {
          console.log(tag, event);
          return;
        }
        console.log(tag, event, data);
      }
    : noopLog;

const createMcpAdapter = (api: GameApi, logger: ReturnType<typeof getLogger>): GameApi => ({
  getState: () => {
    const state = api.getState();
    logger('getState', state);
    return state;
  },
  getActions: () => {
    const actions = api.getActions();
    logger('getActions', actions);
    return actions;
  },
  act: (actionId: string, payload?: unknown) => {
    const state = api.act(actionId, payload);
    logger('act', { actionId, payload, state });
    return state;
  }
});

export const registerGame = (api: GameApi, options: RegisterOptions = {}): GameApi => {
  if (typeof window === 'undefined') {
    return api;
  }

  const logger = getLogger(Boolean(options.log), options.tag ?? defaultTag);
  const mcpAdapter = createMcpAdapter(api, logger);

  window.__GAME__ = api;
  window.__MCP__ = mcpAdapter;
  return api;
};

export const getGame = (): GameApi | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.__GAME__ ?? null;
};

export const getMcp = (): GameApi | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.__MCP__ ?? null;
};

declare global {
  interface Window {
    __GAME__?: GameApi;
    __MCP__?: GameApi;
  }
}
