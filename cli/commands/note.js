import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { resolveAtomPath } from '../lib/resolve-atom.js';

export const noteCommand = new Command('note')
  .argument('<text>', 'Idea text OR atom name to open notes for')
  .description('Capture idea to ideas.md, or open atom notes with `eoe note <atom-name>`')
  .action(async (text) => {
    // Check if the argument is an atom name
    const result = await resolveAtomPath(text);

    if (result.error === 'ambiguous') {
      console.error(chalk.red(`Multiple atoms match "${text}":`));
      result.matches.forEach(match => console.error(chalk.gray(`  ${match}`)));
      console.error(chalk.gray('Use the full name to disambiguate.'));
      process.exit(1);
    }

    if (!result.error) {
      // Resolved to an atom - open NOTES.md
      const notesPath = path.join(result.path, 'NOTES.md');

      if (await fs.pathExists(notesPath)) {
        const editor = process.env.EDITOR || process.env.VISUAL || 'vim';
        console.log(chalk.blue(`Opening notes for ${result.name}...`));

        const child = spawn(editor, [notesPath], {
          stdio: 'inherit'
        });

        child.on('close', (code) => {
          if (code === 0) {
            console.log(chalk.green('Notes saved.'));
          }
        });

        return;
      }
    }

    // Otherwise, capture as quick idea
    const ideasPath = path.resolve('ideas.md');

    if (!await fs.pathExists(ideasPath)) {
      await fs.writeFile(ideasPath, '# Ideas\n\nQuick-capture creative ideas. Add via `eoe note "your idea"` or edit directly.\n\n---\n');
    }

    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const entry = `\n- **${timestamp}:** ${text}\n`;
    await fs.appendFile(ideasPath, entry);

    console.log(chalk.green(`Noted: "${text}"`));
    console.log(chalk.gray(`  Saved to ideas.md`));
  });
