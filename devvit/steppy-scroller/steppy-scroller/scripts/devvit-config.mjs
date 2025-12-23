import path from 'node:path';

export const defaultPostUrl =
  'https://www.reddit.com/r/softwart/comments/1ps7jke/steppyscroller/';

export const resolvePostUrl = () =>
  process.env.DEVVIT_POST_URL ?? process.env.REDDIT_POST_URL ?? defaultPostUrl;

// Auth storage can be shared across worktrees via DEVVIT_AUTH_FILE.
// Fallback: per-worktree cache under playwright/.auth/reddit.json.
export const authFile = path.resolve(
  process.env.DEVVIT_AUTH_FILE ?? path.join('playwright', '.auth', 'reddit.json')
);
