import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export const listCommand = new Command('list')
  .description('List all atoms with type and status')
  .option('-t, --type <type>', 'Filter by type (visual, audio, audio-visual, composition)')
  .option('-s, --stage <stage>', 'Filter by stage (idea, sketch, refine, done)')
  .action(async (options) => {
    const atomsDir = path.resolve('atoms');

    if (!await fs.pathExists(atomsDir)) {
      console.log(chalk.yellow('No atoms directory found'));
      return;
    }

    const entries = await fs.readdir(atomsDir, { withFileTypes: true });
    const atomDirs = entries.filter(d => d.isDirectory());

    if (atomDirs.length === 0) {
      console.log(chalk.yellow('No atoms yet. Run `eoe create <type> <name>` to start.'));
      return;
    }

    // Collect atom metadata
    let rows = [];
    for (const dir of atomDirs) {
      const atomPath = path.join(atomsDir, dir.name);
      const configPath = path.join(atomPath, 'config.json');
      const notesPath = path.join(atomPath, 'NOTES.md');
      const stat = await fs.stat(atomPath);

      // Detect type from config.json or file structure
      let type = 'visual'; // default
      if (await fs.pathExists(configPath)) {
        try {
          const configContent = await fs.readJson(configPath);
          if (configContent.type) {
            type = configContent.type;
          }
        } catch (e) {
          // Fall back to file detection
        }
      }

      // Fallback type detection from files present
      if (type === 'visual') {
        const hasAudioJs = await fs.pathExists(path.join(atomPath, 'audio.js'));
        const hasSketchJs = await fs.pathExists(path.join(atomPath, 'sketch.js'));
        const hasCompositionJs = await fs.pathExists(path.join(atomPath, 'composition.js'));

        if (hasCompositionJs) type = 'composition';
        else if (hasAudioJs && hasSketchJs) type = 'audio-visual';
        else if (hasAudioJs) type = 'audio';
      }

      // Read stage from NOTES.md
      let stage = 'idea';
      if (await fs.pathExists(notesPath)) {
        const notes = await fs.readFile(notesPath, 'utf8');
        const stageMatch = notes.match(/\*\*Stage:\*\*\s*(\w[\w-]*)/);
        if (stageMatch) stage = stageMatch[1];
      }

      // Parse name and date
      const parts = dir.name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
      const date = parts ? parts[1] : 'unknown';
      const name = parts ? parts[2] : dir.name;

      rows.push({
        fullName: dir.name,
        name,
        type,
        stage,
        created: date,
        modified: stat.mtime.toISOString().split('T')[0]
      });
    }

    // Apply filters
    if (options.type) {
      rows = rows.filter(r => r.type === options.type);
    }
    if (options.stage) {
      rows = rows.filter(r => r.stage === options.stage);
    }

    if (rows.length === 0) {
      console.log(chalk.yellow('No atoms match the given filters.'));
      return;
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

    // Summary
    const typeCounts = {};
    const stageCounts = {};
    for (const row of rows) {
      typeCounts[row.type] = (typeCounts[row.type] || 0) + 1;
      stageCounts[row.stage] = (stageCounts[row.stage] || 0) + 1;
    }

    console.log('');
    console.log(chalk.gray(`${rows.length} atom(s)`));

    // Type breakdown
    const typeBreakdown = Object.entries(typeCounts)
      .map(([t, c]) => `${c} ${t}`)
      .join(', ');
    console.log(chalk.gray(`Types: ${typeBreakdown}`));

    // Stage breakdown (WIP tracker - NOTE-03)
    const stageBreakdown = Object.entries(stageCounts)
      .map(([s, c]) => {
        const color = stageColors[s] || chalk.white;
        return color(`${c} ${s}`);
      })
      .join(', ');
    console.log(chalk.gray('Stages: ') + stageBreakdown);
  });
