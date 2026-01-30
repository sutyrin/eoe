/**
 * Aspect ratio utilities for platform-specific video encoding.
 * All atoms are 800x800 (1:1). Platforms need different aspect ratios:
 *   YouTube: 16:9 (1920x1080) - atom centered with black letterbox bars top/bottom
 *   TikTok:  9:16 (1080x1920) - atom centered with black pillarbox bars top/bottom
 *
 * Strategy: Use FFmpeg scale filter to fit within target, then pad to exact dimensions.
 * Never stretch or crop -- always preserve original content with black bars.
 */

/**
 * Platform encoding profiles.
 */
export const PLATFORMS = {
  youtube: {
    width: 1920,
    height: 1080,
    name: 'YouTube',
    aspect: '16:9'
  },
  tiktok: {
    width: 1080,
    height: 1920,
    name: 'TikTok',
    aspect: '9:16'
  }
};

/**
 * Get FFmpeg video filter string for scaling + padding to target dimensions.
 * Uses force_original_aspect_ratio=decrease to fit within bounds,
 * then pads to exact dimensions with black bars centered.
 *
 * @param {object} platform - Platform profile from PLATFORMS
 * @returns {string[]} Array of FFmpeg video filter strings
 */
export function getVideoFilters(platform) {
  const { width, height } = platform;
  return [
    `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`
  ];
}

/**
 * Get the subdirectory name for a platform's output files.
 * @param {string} platformKey - Key from PLATFORMS (e.g., 'youtube', 'tiktok')
 * @returns {string} Directory name
 */
export function getPlatformDir(platformKey) {
  return platformKey; // 'youtube' or 'tiktok'
}
