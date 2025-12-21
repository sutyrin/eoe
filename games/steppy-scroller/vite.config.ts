import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      allow: ['..', '../../..']
    }
  },
  plugins: [
    {
      name: 'mock-api',
      configureServer(server) {
        const db = new Map();

        server.middlewares.use('/api/state', (req, res, next) => {
          const clientId = (req.headers['x-client-id'] as string) || 'default';

          if (req.method === 'GET') {
            const state = db.get(clientId);
            res.setHeader('Content-Type', 'application/json');
            if (state) {
              res.end(JSON.stringify({ state }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                db.set(clientId, data.state);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          next();
        });
      }
    }
  ]
});
