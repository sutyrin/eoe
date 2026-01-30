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
    // Smart completion: show short names by default, full names when user types a digit
    // This lets users search by name (my-first-sketch) or by date (2026-01-30...)

    // Get the current word being typed (the partial atom name)
    // env.words is array like ['eoe', 'capture', '2']
    // env.cword is the index of current word being completed
    const currentWord = env.words && env.cword !== undefined
      ? env.words[env.cword]
      : '';

    const isDateSearch = /^\d/.test(currentWord); // Starts with digit

    let suggestions;
    if (isDateSearch) {
      // User typed a digit: show full date-prefixed names
      suggestions = await getAtomNames();
    } else {
      // User typed empty or letter: show short names (user-friendly)
      suggestions = await getShortNames();
    }

    return tabtab.log(suggestions);
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
