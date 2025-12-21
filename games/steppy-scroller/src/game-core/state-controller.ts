import { applyAction, type GameState } from './steppy';

type StateStore = {
  load: () => Promise<GameState>;
  save: (state: GameState) => Promise<void>;
};

type ControllerOptions = {
  onState: (state: GameState) => void;
  onError?: (error: unknown) => void;
};

export const createStateController = (store: StateStore, options: ControllerOptions) => {
  let state: GameState | null = null;

  const init = async () => {
    state = await store.load();
    options.onState(state);
    return state;
  };

  const act = (actionId: string) => {
    if (!state) {
      return;
    }
    state = applyAction(state, actionId);
    options.onState(state);
    store.save(state).catch((error) => options.onError?.(error));
  };

  const getState = () => state;

  return { init, act, getState };
};
