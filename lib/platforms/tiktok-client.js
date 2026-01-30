import fs from 'fs';
import { withRetry } from '../utils/retry.js';
import { getTikTokAccessToken } from './oauth-manager.js';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

/**
 * Upload a video to TikTok using the Content Posting API.
 * Two-step process: initialize upload, then PUT video to upload URL.
 *
 * Note: Videos from unverified API clients are private-only until audit approval.
 *
 * @param {object} options
 * @param {string} options.videoPath - Path to MP4 video file
 * @param {string} options.title - Video title/caption (required)
 * @param {string} options.privacyLevel - 'PUBLIC_TO_EVERYONE', 'SELF_ONLY', etc. (default: 'SELF_ONLY')
 * @param {number} options.coverTimestamp - Cover frame timestamp in ms (default: 1000)
 * @returns {Promise<{publishId: string, status: string}>}
 */
export async function uploadToTikTok(options) {
  const {
    videoPath,
    title,
    privacyLevel = 'SELF_ONLY', // Safe default until audit
    coverTimestamp = 1000
  } = options;

  const accessToken = await getTikTokAccessToken();
  if (!accessToken) {
    throw new Error('Not authenticated with TikTok. Run `eoe auth tiktok` first.');
  }

  const videoSize = fs.statSync(videoPath).size;

  // Step 1: Initialize upload
  const initResponse = await withRetry(async () => {
    const res = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: coverTimestamp
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: videoSize, // Single chunk for small files
          total_chunk_count: 1
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(`TikTok init failed: ${res.status} ${errorData.error?.message || res.statusText}`);
      error.response = { status: res.status };
      throw error;
    }

    return res.json();
  });

  const { publish_id, upload_url } = initResponse.data;

  // Step 2: Upload video to provided URL
  const videoBuffer = fs.readFileSync(videoPath);

  await withRetry(async () => {
    const res = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length)
      },
      body: videoBuffer
    });

    if (!res.ok) {
      const error = new Error(`TikTok upload failed: ${res.status} ${res.statusText}`);
      error.response = { status: res.status };
      throw error;
    }
  });

  return {
    publishId: publish_id,
    status: privacyLevel === 'SELF_ONLY' ? 'private (audit required for public)' : 'submitted'
  };
}
