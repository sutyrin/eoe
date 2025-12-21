import type { GameState } from '@eoe/game-core/steppy';

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
