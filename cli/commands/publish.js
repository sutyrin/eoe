import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { resolveAtomPath } from '../lib/resolve-atom.js';

export const publishCommand = new Command('publish')
  .argument('<video>', 'Path to video file (e.g., videos/youtube/2026-01-30-my-sketch.mp4)')
  .requiredOption('-p, --platform <platform>', 'Target platform (youtube)')
  .requiredOption('-t, --title <title>', 'Video title')
  .option('--description <text>', 'Video description')
  .option('--tags <tags>', 'Comma-separated tags', '')
  .option('--thumbnail <path>', 'Path to thumbnail image')
  .option('--privacy <status>', 'Privacy status (public, private, unlisted)', 'public')
  .option('--atom <name>', 'Atom name (for NOTES.md tracking)')
  .description('Publish a video to a platform')
  .action(async (videoArg, options) => {
    const videoPath = path.resolve(videoArg);

    // Validate video file exists
    if (!await fs.pathExists(videoPath)) {
      console.error(chalk.red(`Video file not found: ${videoPath}`));
      process.exit(1);
    }

    // Validate platform
    const validPlatforms = ['youtube'];
    if (!validPlatforms.includes(options.platform)) {
      console.error(chalk.red(`Platform "${options.platform}" not supported. Available: ${validPlatforms.join(', ')}`));
      process.exit(1);
    }

    // Check authentication
    const { hasCredentials } = await import('../../lib/utils/credentials.js');
    if (!await hasCredentials(options.platform)) {
      console.error(chalk.red(`Not authenticated with ${options.platform}.`));
      console.error(chalk.gray(`Run: eoe auth ${options.platform}`));
      process.exit(1);
    }

    const tags = options.tags ? options.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const fileSizeMB = ((await fs.stat(videoPath)).size / (1024 * 1024)).toFixed(2);

    console.log(chalk.blue(`Publishing to ${options.platform}...`));
    console.log(chalk.gray(`  Video: ${videoPath} (${fileSizeMB} MB)`));
    console.log(chalk.gray(`  Title: ${options.title}`));
    if (options.description) console.log(chalk.gray(`  Description: ${options.description.substring(0, 80)}...`));
    if (tags.length) console.log(chalk.gray(`  Tags: ${tags.join(', ')}`));
    console.log(chalk.gray(`  Privacy: ${options.privacy}`));
    console.log();

    try {
      const { uploadToYouTube } = await import('../../lib/platforms/youtube-client.js');
      const result = await uploadToYouTube({
        videoPath,
        title: options.title,
        description: options.description || '',
        tags,
        privacyStatus: options.privacy,
        thumbnailPath: options.thumbnail ? path.resolve(options.thumbnail) : undefined,
        onProgress: (uploaded, total, message) => {
          if (message) {
            console.log(chalk.yellow(`  ${message}`));
          }
        }
      });

      console.log(chalk.green(`\nPublished to YouTube!`));
      console.log(chalk.gray(`  Video ID: ${result.videoId}`));
      console.log(chalk.blue(`  URL: ${result.url}`));

      // Track in NOTES.md if atom specified or derivable from video path
      const atomName = options.atom || deriveAtomName(videoPath);
      if (atomName) {
        await trackPublication(atomName, options.platform, result);
      }

    } catch (err) {
      const { isAuthError } = await import('../../lib/utils/retry.js');
      if (isAuthError(err)) {
        console.error(chalk.red(`\nAuthentication expired or revoked.`));
        console.error(chalk.gray(`Run: eoe auth ${options.platform}`));
      } else {
        console.error(chalk.red(`\nPublish failed: ${err.message}`));
      }
      process.exit(1);
    }
  });

/**
 * Derive atom name from video file path.
 * e.g., videos/youtube/2026-01-30-my-sketch.mp4 -> 2026-01-30-my-sketch
 */
function deriveAtomName(videoPath) {
  const basename = path.basename(videoPath, path.extname(videoPath));
  // Check if this corresponds to an atom
  const atomPath = path.resolve('atoms', basename);
  // Return the basename as potential atom name (will be validated in trackPublication)
  return basename;
}

/**
 * Append publication record to atom's NOTES.md.
 * Creates a "## Published" section if it doesn't exist.
 */
async function trackPublication(atomName, platform, result) {
  // Try to resolve atom path
  const atomResult = await resolveAtomPath(atomName);
  if (atomResult.error) return; // Silently skip if atom not found

  const notesPath = path.join(atomResult.path, 'NOTES.md');
  if (!await fs.pathExists(notesPath)) return;

  let content = await fs.readFile(notesPath, 'utf8');
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

  // Build publication entry
  let entry;
  if (platform === 'youtube') {
    entry = `- **YouTube:** ${result.url} (${timestamp})`;
  } else {
    return; // Only track YouTube in notes
  }

  // Find or create Published section
  if (content.includes('## Published')) {
    // Append to existing Published section
    content = content.replace('## Published\n', `## Published\n${entry}\n`);
  } else {
    // Add Published section before Session Log
    if (content.includes('## Session Log')) {
      content = content.replace('## Session Log', `## Published\n${entry}\n\n## Session Log`);
    } else {
      // Append to end
      content += `\n## Published\n${entry}\n`;
    }
  }

  await fs.writeFile(notesPath, content);
  console.log(chalk.gray(`\n  Tracked in ${notesPath}`));
}
