import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { withRetry } from '../utils/retry.js';
import { getAuthenticatedYouTubeClient } from './oauth-manager.js';

/**
 * Upload a video to YouTube using the Data API v3.
 * Uses resumable upload protocol for reliability.
 *
 * @param {object} options
 * @param {string} options.videoPath - Path to MP4 video file
 * @param {string} options.title - Video title (required)
 * @param {string} options.description - Video description (optional)
 * @param {string[]} options.tags - Video tags (optional)
 * @param {string} options.privacyStatus - 'public', 'private', or 'unlisted' (default: 'public')
 * @param {string} options.thumbnailPath - Path to thumbnail image (optional)
 * @param {function} options.onProgress - Progress callback (bytesUploaded, totalBytes)
 * @returns {Promise<{videoId: string, url: string}>}
 */
export async function uploadToYouTube(options) {
  const {
    videoPath,
    title,
    description = '',
    tags = [],
    privacyStatus = 'public',
    thumbnailPath,
    onProgress
  } = options;

  // Get authenticated client
  const oauth2Client = await getAuthenticatedYouTubeClient();
  if (!oauth2Client) {
    throw new Error('Not authenticated with YouTube. Run `eoe auth youtube` first.');
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Upload video with retry logic
  const response = await withRetry(
    async () => {
      return youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '22' // People & Blogs (fits creative coding)
          },
          status: {
            privacyStatus
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });
    },
    {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        if (onProgress) {
          onProgress(null, null, `Retry attempt ${attempt}: ${error.message}`);
        }
      }
    }
  );

  const videoId = response.data.id;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  // Upload custom thumbnail if provided
  if (thumbnailPath && await fs.promises.access(thumbnailPath).then(() => true).catch(() => false)) {
    try {
      await withRetry(async () => {
        return youtube.thumbnails.set({
          videoId,
          media: {
            body: fs.createReadStream(thumbnailPath)
          }
        });
      });
    } catch (err) {
      // Thumbnail upload is non-critical -- log but don't fail
      console.warn(`Warning: Thumbnail upload failed: ${err.message}`);
    }
  }

  return { videoId, url };
}
