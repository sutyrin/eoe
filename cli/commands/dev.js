import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

export const devCommand = new Command('dev')
  .argument('<atom>', 'Atom name to develop (e.g., 2026-01-29-spiral)')
  .description('Start Vite dev server for an atom with hot-reload')
  .action(async (atomName) => {
    const atomPath = path.resolve('atoms', atomName);

    if (!await fs.pathExists(atomPath)) {
      console.error(chalk.red(`Atom "${atomName}" not found in atoms/`));
      console.error(chalk.gray('Run `eoe create visual <name>` to create one'));
      process.exit(1);
    }

    // Append session log entry to NOTES.md
    const notesPath = path.join(atomPath, 'NOTES.md');
    if (await fs.pathExists(notesPath)) {
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
      const sessionEntry = `\n### ${timestamp}\n- \n`;
      await fs.appendFile(notesPath, sessionEntry);
      console.log(chalk.gray('Session logged to NOTES.md'));
    }

    console.log(chalk.blue(`Starting dev server for ${atomName}...`));
    console.log(chalk.gray(`Opening: http://localhost:5173/atoms/${atomName}/index.html`));

    // Start Vite with open flag pointing to the atom
    const vite = spawn('npx', ['vite', '--open', `/atoms/${atomName}/index.html`], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    vite.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(chalk.red(`Vite exited with code ${code}`));
      }
    });
  });
