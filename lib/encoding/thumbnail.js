import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs-extra';

// Configure fluent-ffmpeg to use bundled FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Extract thumbnail images from a video at specific timestamps.
 * Default timestamps: 1s, 5s, and duration/2 (midpoint).
 *
 * @param {string} videoPath - Path to video file
 * @param {string} outputDir - Directory for thumbnail output (videos/thumbnails/)
 * @param {string} atomName - Atom name for output filenames
 * @param {object} options
 * @param {number[]} options.timestamps - Timestamps in seconds to extract (default: [1, 5, midpoint])
 * @param {number} options.duration - Video duration in seconds (for midpoint calculation)
 * @returns {Promise<string[]>} Array of output thumbnail paths
 */
export async function extractThumbnails(videoPath, outputDir, atomName, options = {}) {
  const { duration = 10 } = options;
  const timestamps = options.timestamps || [1, 5, Math.floor(duration / 2)];

  // Ensure thumbnails directory exists
  const thumbDir = path.join(outputDir, 'thumbnails');
  await fs.ensureDir(thumbDir);

  const outputPaths = [];

  for (const timestamp of timestamps) {
    // Skip timestamps beyond video duration
    if (timestamp > duration) continue;

    const outputPath = path.join(thumbDir, `${atomName}-${timestamp}s.jpg`);

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .outputOptions([
          '-frames:v 1',
          '-q:v 2'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', (err) => {
          reject(new Error(`Thumbnail extraction failed at ${timestamp}s: ${err.message}`));
        })
        .run();
    });

    outputPaths.push(outputPath);
  }

  return outputPaths;
}

/**
 * Extract the "best" thumbnail using FFmpeg's thumbnail filter.
 * Analyzes frames to find the most representative one.
 *
 * @param {string} videoPath - Path to video file
 * @param {string} outputDir - Directory for thumbnail output
 * @param {string} atomName - Atom name for output filename
 * @returns {Promise<string>} Path to extracted thumbnail
 */
export async function extractBestThumbnail(videoPath, outputDir, atomName) {
  const thumbDir = path.join(outputDir, 'thumbnails');
  await fs.ensureDir(thumbDir);

  const outputPath = path.join(thumbDir, `${atomName}-best.jpg`);

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', 'thumbnail=300',
        '-frames:v 1',
        '-q:v 2'
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => {
        reject(new Error(`Best thumbnail extraction failed: ${err.message}`));
      })
      .run();
  });

  return outputPath;
}
