import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export const noteCommand = new Command('note')
  .argument('<text>', 'Idea or note text')
  .description('Capture a quick idea to ideas.md')
  .action(async (text) => {
    const ideasPath = path.resolve('ideas.md');

    // Create ideas.md if it doesn't exist
    if (!await fs.pathExists(ideasPath)) {
      await fs.writeFile(ideasPath, '# Ideas\n\nQuick-capture creative ideas. Add via `eoe note "your idea"` or edit directly.\n\n---\n');
    }

    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const entry = `\n- **${timestamp}:** ${text}\n`;
    await fs.appendFile(ideasPath, entry);

    console.log(chalk.green(`Noted: "${text}"`));
    console.log(chalk.gray(`  Saved to ideas.md`));
  });
