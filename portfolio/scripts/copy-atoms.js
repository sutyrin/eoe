import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { bundleAtoms } from './bundle-atoms.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const atomsSrc = path.resolve(__dirname, '../../atoms');
const atomsDest = path.resolve(__dirname, '../public/atoms');

// Clean and copy
await fs.remove(atomsDest);
if (await fs.pathExists(atomsSrc)) {
  await fs.copy(atomsSrc, atomsDest);
  const atoms = (await fs.readdir(atomsSrc, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name);
  console.log(`Copied ${atoms.length} atoms to portfolio/public/atoms/`);
} else {
  await fs.ensureDir(atomsDest);
  console.log('No atoms found, created empty atoms directory');
}

// Bundle atoms after copying
await bundleAtoms();
