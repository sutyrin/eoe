import path from 'node:path';

export const defaultPostUrl =
  'https://www.reddit.com/r/softwart/comments/1ps7jke/steppyscroller/';

export const resolvePostUrl = () =>
  process.env.DEVVIT_POST_URL ?? process.env.REDDIT_POST_URL ?? defaultPostUrl;

export const authFile = path.resolve('playwright', '.auth', 'reddit.json');
