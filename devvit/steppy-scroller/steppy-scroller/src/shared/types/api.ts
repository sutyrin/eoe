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

export type InitResponse = {
  type: 'init';
  postId: string;
  userId: string;
  state: GameState;
};

export type SaveResponse = {
  type: 'save';
  postId: string;
  userId: string;
  state: GameState;
};
