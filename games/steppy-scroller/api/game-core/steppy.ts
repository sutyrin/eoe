export const STEPPY_VERSION = '0.1';
export const STEPPY_COLUMNS = 5;
export const STEPPY_ROWS = 9;

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
