import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

export const buildCommand = new Command('build')
  .argument('<atom>', 'Atom name to build (e.g., 2026-01-30-my-tune)')
  .description('Build a production bundle for an atom')
  .action(async (atomName) => {
    const atomPath = path.resolve('atoms', atomName);
    const distPath = path.resolve('dist', atomName);

    // Validate atom exists
    if (!await fs.pathExists(atomPath)) {
      console.error(chalk.red(`Atom "${atomName}" not found in atoms/`));
      process.exit(1);
    }

    // Validate atom has index.html
    const indexPath = path.join(atomPath, 'index.html');
    if (!await fs.pathExists(indexPath)) {
      console.error(chalk.red(`Atom "${atomName}" has no index.html`));
      process.exit(1);
    }

    console.log(chalk.blue(`Building ${atomName}...`));

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
          console.log(chalk.green(`\nBuild complete: dist/${atomName}/`));
          console.log(chalk.gray(`  ${files.length} files produced`));
          console.log(chalk.gray(`  Preview: npx vite preview --outDir dist/${atomName}`));
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
