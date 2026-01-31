import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'EOE Atoms Gallery',
        short_name: 'EOE',
        description: 'Browse and annotate visual/audio atoms',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/404',
        globPatterns: ['**/*.{css,js,html,svg,png,webp,woff,woff2}'],
        runtimeCaching: [
          {
            // Atom code files - cache first (they rarely change)
            urlPattern: /\/atoms\/.*\.(js|html|json)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'atom-code',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 365 * 24 * 60 * 60
              }
            }
          },
          {
            // Thumbnails - stale while revalidate
            urlPattern: /\/thumbnails\/.*\.webp$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'thumbnails',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          },
          {
            // API calls (Whisper transcription) - never cache
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  vite: {
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
});
