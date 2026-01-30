import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export const statusCommand = new Command('status')
  .description('Show WIP status of all atoms')
  .action(async () => {
    const atomsDir = path.resolve('atoms');

    if (!await fs.pathExists(atomsDir)) {
      console.log(chalk.yellow('No atoms directory found'));
      return;
    }

    const entries = await fs.readdir(atomsDir, { withFileTypes: true });
    const atoms = entries.filter(d => d.isDirectory());

    if (atoms.length === 0) {
      console.log(chalk.yellow('No atoms yet. Run `eoe create <type> <name>` to start.'));
      return;
    }

    // Collect atom data
    const rows = [];
    for (const atom of atoms) {
      const atomPath = path.join(atomsDir, atom.name);
      const configPath = path.join(atomPath, 'config.json');
      const notesPath = path.join(atomPath, 'NOTES.md');
      const stat = await fs.stat(atomPath);

      // Detect type
      let type = 'visual';
      if (await fs.pathExists(configPath)) {
        try {
          const config = await fs.readJson(configPath);
          if (config.type) type = config.type;
        } catch (e) { /* ignore */ }
      }

      // Read stage
      let stage = 'idea';
      if (await fs.pathExists(notesPath)) {
        const notes = await fs.readFile(notesPath, 'utf8');
        const stageMatch = notes.match(/\*\*Stage:\*\*\s*(\w[\w-]*)/);
        if (stageMatch) stage = stageMatch[1];
      }

      // Parse name and date
      const parts = atom.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      const date = parts ? parts[1] : 'unknown';
      const name = parts ? parts[2] : atom.name;

      rows.push({
        name,
        type,
        stage,
        created: date,
        modified: stat.mtime.toISOString().split('T')[0]
      });
    }

    // Sort newest first
    rows.sort((a, b) => b.created.localeCompare(a.created));

    // Color functions
    const typeColors = {
      visual: chalk.cyan,
      audio: chalk.magenta,
      'audio-visual': chalk.yellow,
      composition: chalk.green
    };
    const stageColors = {
      idea: chalk.gray,
      sketch: chalk.blue,
      refine: chalk.yellow,
      done: chalk.green
    };

    // Calculate column widths
    const nameWidth = Math.max(4, ...rows.map(r => r.name.length));
    const typeWidth = Math.max(4, ...rows.map(r => r.type.length));

    // Print header
    const header = `${'NAME'.padEnd(nameWidth)}  ${'TYPE'.padEnd(typeWidth)}  ${'STAGE'.padEnd(7)}  ${'CREATED'.padEnd(10)}  MODIFIED`;
    console.log(chalk.bold(header));
    console.log('-'.repeat(header.length));

    // Print rows
    for (const row of rows) {
      const typeColor = typeColors[row.type] || chalk.white;
      const stageColor = stageColors[row.stage] || chalk.white;
      console.log(
        `${row.name.padEnd(nameWidth)}  ${typeColor(row.type.padEnd(typeWidth))}  ${stageColor(row.stage.padEnd(7))}  ${row.created.padEnd(10)}  ${row.modified}`
      );
    }

    // WIP Summary (NOTE-03)
    console.log('');
    const stageCounts = {};
    const typeCounts = {};
    for (const row of rows) {
      stageCounts[row.stage] = (stageCounts[row.stage] || 0) + 1;
      typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
    }

    // Progress bar
    const total = rows.length;
    const done = stageCounts.done || 0;
    const wip = (stageCounts.sketch || 0) + (stageCounts.refine || 0);
    const ideas = stageCounts.idea || 0;

    const barWidth = 30;
    const doneBars = Math.round((done / total) * barWidth);
    const wipBars = Math.round((wip / total) * barWidth);
    const ideaBars = barWidth - doneBars - wipBars;

    const bar = chalk.green('='.repeat(doneBars)) +
                chalk.yellow('='.repeat(wipBars)) +
                chalk.gray('-'.repeat(Math.max(0, ideaBars)));

    console.log(`Progress: [${bar}] ${done}/${total} done`);
    console.log(
      chalk.gray('  ') +
      chalk.green(`${done} done`) + chalk.gray(' | ') +
      chalk.yellow(`${wip} wip`) + chalk.gray(' | ') +
      chalk.gray(`${ideas} idea`)
    );

    // Type summary
    const typeBreakdown = Object.entries(typeCounts)
      .map(([t, c]) => {
        const color = typeColors[t] || chalk.white;
        return color(`${c} ${t}`);
      })
      .join(chalk.gray(' | '));
    console.log(chalk.gray('  ') + typeBreakdown);

    console.log(chalk.gray(`\n${total} atom(s) total`));
  });
