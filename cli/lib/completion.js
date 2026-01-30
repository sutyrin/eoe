import tabtab from 'tabtab';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Get list of atom names for completion (in reverse chronological order - newest first)
 */
export async function getAtomNames() {
  const atomsDir = path.resolve(path.join(__dirname, '../../atoms'));
  if (!await fs.pathExists(atomsDir)) return [];

  const entries = await fs.readdir(atomsDir, { withFileTypes: true });
  return entries
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
    .reverse(); // Reverse alphabetical: newest (recent date) at top
}

/**
 * Get list of short atom names (date prefix stripped) for completion (in reverse chronological order)
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
  // Preserve order from fullNames (reverse chronological)
  return [...new Set(shortNames)];
}

/**
 * Setup completion for atom name arguments
 * NOTE: Any NEW commands that take atom arguments MUST be added to the atomCommands list
 * to prevent this completion gap from repeating.
 */
export async function setupCompletion(env) {
  // All commands that accept atom name arguments (atom is first positional arg)
  // UPDATE THIS LIST when adding new commands that take atom names
  const atomCommands = ['dev', 'build', 'note', 'capture', 'auth', 'publish'];

  // Complete atom names for commands that accept atom arguments
  if (atomCommands.includes(env.prev)) {
    const shortNames = await getShortNames();

    // Show only short names (unique, user-friendly)
    // resolveAtomPath() CLI helper handles both short and full name resolution at runtime
    return tabtab.log(shortNames);
  }

  // Complete command names at top level
  if (!env.prev || env.prev === 'eoe') {
    return tabtab.log([
      'create', 'dev', 'build', 'capture',
      'list', 'note', 'status', 'auth', 'publish',
      'completion'
    ]);
  }
}
