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
 * Get list of short atom names (date prefix stripped) for completion
 */
export async function getShortNames() {
  const fullNames = await getAtomNames();
  const datePattern = /^\d{4}-\d{2}-\d{2}-/;

  const shortNames = fullNames.map(name => {
    if (datePattern.test(name)) {
      return name.replace(datePattern, '');
    }
    return name; // Already a short name
  });

  // Deduplicate (multiple dates might yield same short name)
  return [...new Set(shortNames)].sort();
}

/**
 * Setup completion for atom name arguments
 */
export async function setupCompletion(env) {
  // Complete atom names for: dev, build, note commands
  if (env.prev === 'dev' || env.prev === 'build' || env.prev === 'note') {
    const shortNames = await getShortNames();
    const fullNames = await getAtomNames();

    // Combine: short names first (primary UX), then full names
    // Deduplicate in case a folder has no date prefix (appears in both lists)
    const combined = [...new Set([...shortNames, ...fullNames])];

    return tabtab.log(combined);
  }

  // Complete command names at top level
  if (!env.prev || env.prev === 'eoe') {
    return tabtab.log([
      'create', 'dev', 'build', 'list',
      'note', 'status', 'completion'
    ]);
  }
}
