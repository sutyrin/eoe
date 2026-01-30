import { defineConfig } from 'astro/config';

export default defineConfig({
  // Atoms are loaded at build time from ../atoms/
  // Each atom's sketch.js is copied to public/ during build
  vite: {
    // Allow importing from parent directory (atoms/)
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
});
