import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export const statusCommand = new Command('status')
  .description('Show status of all atoms')
  .action(async () => {
    const atomsDir = path.resolve('atoms');

    if (!await fs.pathExists(atomsDir)) {
      console.log(chalk.yellow('No atoms directory found'));
      return;
    }

    const entries = await fs.readdir(atomsDir, { withFileTypes: true });
    const atoms = entries.filter(d => d.isDirectory());

    if (atoms.length === 0) {
      console.log(chalk.yellow('No atoms yet. Run `eoe create visual <name>` to start.'));
      return;
    }

    // Collect atom data
    const rows = [];
    for (const atom of atoms) {
      const atomPath = path.join(atomsDir, atom.name);
      const notesPath = path.join(atomPath, 'NOTES.md');
      const stat = await fs.stat(atomPath);

      let stage = 'idea';
      if (await fs.pathExists(notesPath)) {
        const notes = await fs.readFile(notesPath, 'utf8');
        const stageMatch = notes.match(/\*\*Stage:\*\*\s*(\w+)/);
        if (stageMatch) stage = stageMatch[1];
      }

      // Parse name and date from folder name
      const parts = atom.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      const date = parts ? parts[1] : 'unknown';
      const name = parts ? parts[2] : atom.name;

      rows.push({
        name,
        stage,
        created: date,
        modified: stat.mtime.toISOString().split('T')[0]
      });
    }

    // Sort newest first
    rows.sort((a, b) => b.created.localeCompare(a.created));

    // Print table
    const stageColors = {
      idea: chalk.gray,
      sketch: chalk.blue,
      refine: chalk.yellow,
      done: chalk.green
    };

    // Calculate column widths
    const nameWidth = Math.max(4, ...rows.map(r => r.name.length));
    const header = `${'NAME'.padEnd(nameWidth)}  ${'STAGE'.padEnd(7)}  ${'CREATED'.padEnd(10)}  MODIFIED`;
    console.log(chalk.bold(header));
    console.log('-'.repeat(header.length));

    for (const row of rows) {
      const colorFn = stageColors[row.stage] || chalk.white;
      console.log(
        `${row.name.padEnd(nameWidth)}  ${colorFn(row.stage.padEnd(7))}  ${row.created.padEnd(10)}  ${row.modified}`
      );
    }

    console.log(chalk.gray(`\n${rows.length} atom(s)`));
  });
