import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createCommand = new Command('create')
  .argument('<type>', 'Atom type (visual, audio, audio-visual, composition)')
  .argument('<name>', 'Atom name (lowercase, no spaces)')
  .description('Scaffold a new atom from template')
  .action(async (type, name) => {
    const validTypes = ['visual', 'audio', 'audio-visual', 'composition'];
    if (!validTypes.includes(type)) {
      console.error(chalk.red(`Type "${type}" not supported. Available: ${validTypes.join(', ')}`));
      process.exit(1);
    }

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].slice(0, 5);
    const atomName = `${date}-${name}`;
    const atomPath = path.resolve('atoms', atomName);

    if (await fs.pathExists(atomPath)) {
      console.error(chalk.red(`Atom "${atomName}" already exists`));
      process.exit(1);
    }

    const templatePath = path.join(__dirname, `../templates/${type}`);
    await fs.copy(templatePath, atomPath);

    // Replace placeholders in all files
    const files = await fs.readdir(atomPath);
    for (const file of files) {
      const filePath = path.join(atomPath, file);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        let content = await fs.readFile(filePath, 'utf8');
        content = content.replaceAll('{{ATOM_NAME}}', name);
        content = content.replaceAll('{{FULL_ATOM_NAME}}', atomName);
        content = content.replaceAll('{{DATE}}', date);
        content = content.replaceAll('{{TIME}}', time);
        await fs.writeFile(filePath, content);
      }
    }

    console.log(chalk.green(`Created atom: ${atomName}`));
    console.log(chalk.gray(`  cd atoms/${atomName}`));
    console.log(chalk.gray(`  eoe dev ${atomName}`));
  });
