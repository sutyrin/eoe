import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { resolveAtomPath } from '../lib/resolve-atom.js';

export const devCommand = new Command('dev')
  .argument('<atom>', 'Atom name to develop (e.g., my-first-sketch or 2026-01-30-my-first-sketch)')
  .description('Start Vite dev server for an atom with hot-reload')
  .action(async (atomName) => {
    const result = await resolveAtomPath(atomName);

    if (result.error === 'not_found') {
      console.error(chalk.red(`Atom "${atomName}" not found in atoms/`));
      console.error(chalk.gray('Run `eoe create visual <name>` to create one'));
      process.exit(1);
    }

    if (result.error === 'ambiguous') {
      console.error(chalk.red(`Multiple atoms match "${atomName}":`));
      result.matches.forEach(match => console.error(chalk.gray(`  ${match}`)));
      console.error(chalk.gray('Use the full name to disambiguate.'));
      process.exit(1);
    }

    const atomPath = result.path;
    const resolvedName = result.name;

    // Append session log entry to NOTES.md
    const notesPath = path.join(atomPath, 'NOTES.md');
    if (await fs.pathExists(notesPath)) {
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
      const sessionEntry = `\n### ${timestamp}\n- \n`;
      await fs.appendFile(notesPath, sessionEntry);
      console.log(chalk.gray('Session logged to NOTES.md'));
    }

    console.log(chalk.blue(`Starting dev server for ${resolvedName}...`));
    console.log(chalk.gray(`Opening: http://localhost:5173/atoms/${resolvedName}/index.html`));

    // Start Vite with open flag pointing to the atom
    const vite = spawn('npx', ['vite', '--open', `/atoms/${resolvedName}/index.html`], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    vite.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(chalk.red(`Vite exited with code ${code}`));
      }
    });
  });
