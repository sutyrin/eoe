import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const atomsDir = resolve(__dirname, 'atoms');
const input = {};

// Auto-discover atoms
if (existsSync(atomsDir)) {
  const atoms = readdirSync(atomsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  atoms.forEach(atom => {
    const htmlPath = resolve(atomsDir, atom, 'index.html');
    if (existsSync(htmlPath)) {
      input[atom] = htmlPath;
    }
  });
}

// Add dashboard if exists
const dashboardHtml = resolve(__dirname, 'dashboard/index.html');
if (existsSync(dashboardHtml)) {
  input.dashboard = dashboardHtml;
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.keys(input).length > 0 ? input : undefined
    }
  },
  server: {
    open: '/dashboard/index.html'
  }
});
