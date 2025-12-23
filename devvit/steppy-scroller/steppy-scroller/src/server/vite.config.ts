import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';
import { execSync } from 'node:child_process';

const resolveGitSha = () => {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  logLevel: 'warn',
  define: {
    __BUILD_SHA__: JSON.stringify(resolveGitSha()),
  },
  build: {
    ssr: 'index.ts',
    outDir: '../../dist/server',
    emptyOutDir: true,
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      external: [...builtinModules],

      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
        inlineDynamicImports: true,
      },
    },
  },
});
