import path from 'path';
import fs from 'fs-extra';

/**
 * Resolve atom name to full path, supporting both short names and full date-prefixed names.
 *
 * @param {string} atomName - Short name (e.g., "my-first-sketch") or full name (e.g., "2026-01-30-my-first-sketch")
 * @returns {Promise<{path: string, name: string} | {error: 'not_found'} | {error: 'ambiguous', matches: string[]}>}
 */
export async function resolveAtomPath(atomName) {
  const atomsDir = path.resolve('atoms');

  // Try exact match first (backward compatibility)
  const exactPath = path.join(atomsDir, atomName);
  if (await fs.pathExists(exactPath)) {
    return { path: exactPath, name: atomName };
  }

  // Scan atoms/ directory for suffix matches
  if (!await fs.pathExists(atomsDir)) {
    return { error: 'not_found' };
  }

  const entries = await fs.readdir(atomsDir, { withFileTypes: true });
  const folders = entries.filter(e => e.isDirectory()).map(e => e.name);

  // Match folders ending with -${atomName} (date-prefix pattern: YYYY-MM-DD-name)
  const matches = folders.filter(folder => folder.endsWith(`-${atomName}`));

  if (matches.length === 0) {
    return { error: 'not_found' };
  }

  if (matches.length === 1) {
    const resolvedPath = path.join(atomsDir, matches[0]);
    return { path: resolvedPath, name: matches[0] };
  }

  // Multiple matches - ambiguous
  return { error: 'ambiguous', matches };
}
