import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const CREDENTIALS_DIR = path.join(os.homedir(), '.eoe');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

/**
 * Load all stored credentials.
 * @returns {Promise<object>} Credentials object keyed by platform
 */
export async function loadCredentials() {
  try {
    if (await fs.pathExists(CREDENTIALS_FILE)) {
      return await fs.readJson(CREDENTIALS_FILE);
    }
  } catch (e) {
    // Corrupted file -- start fresh
  }
  return {};
}

/**
 * Load credentials for a specific platform.
 * @param {string} platform - Platform key ('youtube' or 'tiktok')
 * @returns {Promise<object|null>} Platform credentials or null
 */
export async function loadPlatformCredentials(platform) {
  const creds = await loadCredentials();
  return creds[platform] || null;
}

/**
 * Save credentials for a specific platform.
 * Merges with existing credentials (other platforms preserved).
 *
 * @param {string} platform - Platform key
 * @param {object} tokens - Token data to store
 */
export async function saveCredentials(platform, tokens) {
  await fs.ensureDir(CREDENTIALS_DIR);

  const creds = await loadCredentials();
  creds[platform] = {
    ...tokens,
    savedAt: new Date().toISOString()
  };

  await fs.writeJson(CREDENTIALS_FILE, creds, { spaces: 2 });

  // Restrict file permissions (owner read/write only)
  try {
    await fs.chmod(CREDENTIALS_FILE, 0o600);
  } catch (e) {
    // chmod may not work on all platforms (Windows)
  }
}

/**
 * Remove credentials for a specific platform.
 * @param {string} platform - Platform key
 */
export async function removeCredentials(platform) {
  const creds = await loadCredentials();
  delete creds[platform];
  await fs.writeJson(CREDENTIALS_FILE, creds, { spaces: 2 });
}

/**
 * Check if credentials exist for a platform.
 * @param {string} platform - Platform key
 * @returns {Promise<boolean>}
 */
export async function hasCredentials(platform) {
  const creds = await loadPlatformCredentials(platform);
  return creds !== null;
}

/**
 * Get the credentials file path (for display/debugging).
 * @returns {string}
 */
export function getCredentialsPath() {
  return CREDENTIALS_FILE;
}
