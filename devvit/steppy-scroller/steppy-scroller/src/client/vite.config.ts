import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';

const resolveGitSha = () => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const gitSha = resolveGitSha();
  return {
    logLevel: 'warn',
    define: {
      __BUILD_SHA__: JSON.stringify(gitSha),
    },
    build: {
      outDir: '../../dist/client',
      emptyOutDir: true,
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: {
          splash: 'splash.html',
          game: 'game.html',
        },
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
          sourcemapFileNames: '[name].js.map',
        },
      },
      ...(mode === 'production' && {
        minify: 'terser',
        terserOptions: {
          compress: {
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
      }),
    },
  };
});
