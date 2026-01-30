import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs-extra';
import { PLATFORMS, getVideoFilters } from './aspect-ratio.js';

// Configure fluent-ffmpeg to use bundled FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Encode a master video for a specific platform profile.
 *
 * @param {string} masterPath - Path to master WebM file
 * @param {string} outputPath - Path for output MP4 file
 * @param {string} platformKey - Platform key ('youtube' or 'tiktok')
 * @param {function} onProgress - Optional progress callback (percent: number)
 * @returns {Promise<{outputPath: string, fileSize: number}>}
 */
export async function encodeForPlatform(masterPath, outputPath, platformKey, onProgress) {
  const platform = PLATFORMS[platformKey];
  if (!platform) {
    throw new Error(`Unknown platform: ${platformKey}. Available: ${Object.keys(PLATFORMS).join(', ')}`);
  }

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(outputPath));

  const filters = getVideoFilters(platform);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(masterPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-profile:v high',
        '-level 4.2',
        '-preset slow',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-bf 2',
        '-g 48'
      ])
      .videoFilters(filters)
      .output(outputPath);

    if (onProgress) {
      command = command.on('progress', (progress) => {
        if (progress.percent) {
          onProgress(Math.round(progress.percent));
        }
      });
    }

    command
      .on('end', async () => {
        const stat = await fs.stat(outputPath);
        resolve({
          outputPath,
          fileSize: stat.size
        });
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg encoding failed for ${platform.name}: ${err.message}`));
      })
      .run();
  });
}

/**
 * Encode master video for YouTube (16:9, 1920x1080).
 *
 * @param {string} masterPath - Path to master WebM file
 * @param {string} outputDir - Base output directory (videos/youtube/ will be used)
 * @param {string} atomName - Atom name for output filename
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{outputPath: string, fileSize: number}>}
 */
export async function encodeForYouTube(masterPath, outputDir, atomName, onProgress) {
  const outputPath = path.join(outputDir, 'youtube', `${atomName}.mp4`);
  return encodeForPlatform(masterPath, outputPath, 'youtube', onProgress);
}

/**
 * Encode master video for TikTok (9:16, 1080x1920).
 *
 * @param {string} masterPath - Path to master WebM file
 * @param {string} outputDir - Base output directory (videos/tiktok/ will be used)
 * @param {string} atomName - Atom name for output filename
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{outputPath: string, fileSize: number}>}
 */
export async function encodeForTikTok(masterPath, outputDir, atomName, onProgress) {
  const outputPath = path.join(outputDir, 'tiktok', `${atomName}.mp4`);
  return encodeForPlatform(masterPath, outputPath, 'tiktok', onProgress);
}

/**
 * Encode master video for all supported platforms.
 *
 * @param {string} masterPath - Path to master WebM file
 * @param {string} outputDir - Base output directory
 * @param {string} atomName - Atom name for output filenames
 * @param {function} onProgress - Optional progress callback (platform: string, percent: number)
 * @returns {Promise<Array<{platform: string, outputPath: string, fileSize: number}>>}
 */
export async function encodeForAllPlatforms(masterPath, outputDir, atomName, onProgress) {
  const results = [];

  for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
    const progressCb = onProgress
      ? (percent) => onProgress(platform.name, percent)
      : undefined;

    const result = await encodeForPlatform(
      masterPath,
      path.join(outputDir, platformKey, `${atomName}.mp4`),
      platformKey,
      progressCb
    );

    results.push({
      platform: platform.name,
      aspect: platform.aspect,
      ...result
    });
  }

  return results;
}
