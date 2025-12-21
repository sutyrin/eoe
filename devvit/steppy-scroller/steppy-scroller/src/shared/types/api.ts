export type InitResponse = {
  type: 'init';
  postId: string;
  userId: string;
  count: number;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  userId: string;
  count: number;
};
