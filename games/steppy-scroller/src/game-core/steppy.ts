export const STEPPY_VERSION = '0.1';
export const STEPPY_COLUMNS = 5;
export const STEPPY_ROWS = 9;

export type Action = {
  id: string;
  label: string;
  enabled: boolean;
};

export type PlayerState = {
  x: number;
  y: number;
};

export type GameState = {
  version: string;
  status: 'ready' | 'running' | 'ended';
  tick: number;
  player: PlayerState;
};

export const createInitialState = (): GameState => ({
  version: STEPPY_VERSION,
  status: 'running',
  tick: 0,
  player: { x: Math.floor(STEPPY_COLUMNS / 2), y: 0 },
});

export const computeActions = (state: GameState): Action[] => {
  if (state.status !== 'running') {
    return [];
  }
  return [
    { id: 'step-left', label: '←', enabled: state.player.x > 0 },
    { id: 'step-up', label: '↑', enabled: state.player.y < STEPPY_ROWS - 1 },
    { id: 'step-right', label: '→', enabled: state.player.x < STEPPY_COLUMNS - 1 },
  ];
};

export const applyAction = (state: GameState, actionId: string): GameState => {
  if (state.status !== 'running') {
    return state;
  }
  const next: GameState = {
    ...state,
    player: { ...state.player },
  };

  if (actionId === 'step-left' && next.player.x > 0) {
    next.player.x -= 1;
  }
  if (actionId === 'step-right' && next.player.x < STEPPY_COLUMNS - 1) {
    next.player.x += 1;
  }
  if (actionId === 'step-up' && next.player.y < STEPPY_ROWS - 1) {
    next.player.y += 1;
  }
  next.tick += 1;
  if (next.player.y >= STEPPY_ROWS - 1) {
    next.status = 'ended';
  }
  return next;
};
