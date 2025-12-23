import express from 'express';
import { createInitialState, type GameState } from '@eoe/game-core/steppy';
import { InitResponse, SaveResponse } from '../shared/types/api';
import { BUILD_SHA } from '../shared/build-info';
import { redis, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

const getStateKey = (postId: string, userId: string) => `state:${postId}:${userId}`;

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId, userId } = context;

    if (!postId || !userId) {
      console.error('API Init Error: postId or userId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId and userId are required but missing from context',
      });
      return;
    }

    try {
      const key = getStateKey(postId, userId);
      const raw = await redis.get(key);
      const state = raw ? (JSON.parse(raw) as GameState) : createInitialState();
      if (!raw) {
        await redis.set(key, JSON.stringify(state));
      }
      res.json({
        type: 'init',
        postId,
        userId,
        build: {
          gitSha: BUILD_SHA,
        },
        state,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<
  { postId: string },
  SaveResponse | { status: string; message: string },
  { state?: GameState }
>('/api/save', async (req, res): Promise<void> => {
  const { postId, userId } = context;
  if (!postId || !userId) {
    res.status(400).json({
      status: 'error',
      message: 'postId and userId are required',
    });
    return;
  }
  const incoming = req.body?.state;
  if (!incoming) {
    res.status(400).json({
      status: 'error',
      message: 'state is required',
    });
    return;
  }

  const key = getStateKey(postId, userId);
  const raw = await redis.get(key);
  const current = raw ? (JSON.parse(raw) as GameState) : createInitialState();
  const next = incoming.tick >= current.tick ? incoming : current;
  await redis.set(key, JSON.stringify(next));

  res.json({
    type: 'save',
    postId,
    userId,
    state: next,
  });
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
