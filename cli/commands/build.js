import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { resolveAtomPath } from '../lib/resolve-atom.js';

export const buildCommand = new Command('build')
  .argument('<atom>', 'Atom name to build (e.g., my-first-sketch or 2026-01-30-my-first-sketch)')
  .description('Build a production bundle for an atom')
  .action(async (atomName) => {
    const result = await resolveAtomPath(atomName);

    if (result.error === 'not_found') {
      console.error(chalk.red(`Atom "${atomName}" not found in atoms/`));
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
    const distPath = path.resolve('dist', resolvedName);

    // Validate atom has index.html
    const indexPath = path.join(atomPath, 'index.html');
    if (!await fs.pathExists(indexPath)) {
      console.error(chalk.red(`Atom "${atomName}" has no index.html`));
      process.exit(1);
    }

    console.log(chalk.blue(`Building ${resolvedName}...`));

    // Run Vite build from the atom directory
    // This makes index.html the default entry point
    const vite = spawn('npx', [
      'vite', 'build',
      '--outDir', distPath,
      '--emptyOutDir',
      '--base', './'
    ], {
      stdio: 'inherit',
      cwd: atomPath
    });

    return new Promise((resolve, reject) => {
      vite.on('close', async (code) => {
        if (code !== 0) {
          console.error(chalk.red(`Build failed with code ${code}`));
          process.exit(code);
        }

        // Verify output
        if (await fs.pathExists(distPath)) {
          const files = await fs.readdir(distPath, { recursive: true });
          console.log(chalk.green(`\nBuild complete: dist/${resolvedName}/`));
          console.log(chalk.gray(`  ${files.length} files produced`));
          console.log(chalk.gray(`  Preview: npx vite preview --outDir dist/${resolvedName}`));
        } else {
          console.error(chalk.red('Build completed but output directory not found'));
          process.exit(1);
        }

        resolve();
      });

      vite.on('error', (err) => {
        console.error(chalk.red(`Build error: ${err.message}`));
        reject(err);
      });
    });
  });
