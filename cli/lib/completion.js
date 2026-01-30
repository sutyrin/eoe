import tabtab from 'tabtab';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get list of atom names for completion
 */
export async function getAtomNames() {
  const atomsDir = path.resolve(path.join(__dirname, '../../atoms'));
  if (!await fs.pathExists(atomsDir)) return [];

  const entries = await fs.readdir(atomsDir, { withFileTypes: true });
  return entries
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

/**
 * Setup completion for atom name arguments
 */
export async function setupCompletion(env) {
  const atomNames = await getAtomNames();

  // Complete atom names for: dev, build, note commands
  if (env.prev === 'dev' || env.prev === 'build' || env.prev === 'note') {
    return tabtab.log(atomNames);
  }

  // Complete command names at top level
  if (!env.prev || env.prev === 'eoe') {
    return tabtab.log([
      'create', 'dev', 'build', 'list',
      'note', 'status', 'completion'
    ]);
  }
}
