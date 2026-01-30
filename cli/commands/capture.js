import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import { resolveAtomPath } from '../lib/resolve-atom.js';

export const captureCommand = new Command('capture')
  .argument('<atom>', 'Atom name to capture (e.g., my-first-sketch or 2026-01-30-my-first-sketch)')
  .option('-d, --duration <seconds>', 'Capture duration in seconds', '10')
  .option('--fps <rate>', 'Frame rate for capture', '30')
  .option('-o, --output <dir>', 'Output directory for master video', 'videos/masters')
  .description('Record a running atom to video (canvas + audio)')
  .action(async (atomName, options) => {
    const result = await resolveAtomPath(atomName);

    if (result.error === 'not_found') {
      console.error(chalk.red(`Atom "${atomName}" not found in atoms/`));
      console.error(chalk.gray('Run `eoe list` to see available atoms'));
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
    const duration = parseInt(options.duration, 10);
    const fps = parseInt(options.fps, 10);
    const outputDir = path.resolve(options.output);

    // Validate duration
    if (isNaN(duration) || duration < 1 || duration > 120) {
      console.error(chalk.red('Duration must be between 1 and 120 seconds'));
      process.exit(1);
    }

    // Validate fps
    if (isNaN(fps) || fps < 15 || fps > 60) {
      console.error(chalk.red('FPS must be between 15 and 60'));
      process.exit(1);
    }

    // Detect audio
    const { detectAudioAtom } = await import('../../lib/capture/audio-capture.js');
    const hasAudio = await detectAudioAtom(atomPath);

    console.log(chalk.blue(`Capturing ${resolvedName}...`));
    console.log(chalk.gray(`  Duration: ${duration}s`));
    console.log(chalk.gray(`  FPS: ${fps}`));
    console.log(chalk.gray(`  Audio: ${hasAudio ? 'yes' : 'no'}`));
    console.log(chalk.gray(`  Output: ${outputDir}/`));
    console.log();

    try {
      const { captureAtom } = await import('../../lib/capture/browser-capture.js');

      const startTime = Date.now();
      const result = await captureAtom({
        atomPath,
        atomName: resolvedName,
        duration,
        fps,
        outputDir
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const sizeMB = (result.fileSize / (1024 * 1024)).toFixed(2);

      console.log(chalk.green(`\nCapture complete!`));
      console.log(chalk.gray(`  File: ${result.outputPath}`));
      console.log(chalk.gray(`  Size: ${sizeMB} MB`));
      console.log(chalk.gray(`  Duration: ${result.duration}s`));
      console.log(chalk.gray(`  Elapsed: ${elapsed}s`));
      console.log();
      console.log(chalk.gray(`  Next: eoe encode ${resolvedName}`));

    } catch (err) {
      console.error(chalk.red(`\nCapture failed: ${err.message}`));
      if (err.message.includes('No canvas element')) {
        console.error(chalk.gray('The atom must have a <canvas> element to capture.'));
      }
      if (err.message.includes('chromium')) {
        console.error(chalk.gray('Run `npx playwright install chromium` to install the browser.'));
      }
      process.exit(1);
    }
  });
