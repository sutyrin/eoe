import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import { saveCredentials, loadPlatformCredentials } from '../utils/credentials.js';

const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const REDIRECT_PORT = 8085;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

/**
 * Create an OAuth2 client for YouTube.
 * Requires YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables,
 * or stored in ~/.eoe/credentials.json under 'youtube_app'.
 *
 * @returns {object} Google OAuth2 client
 */
export function createYouTubeOAuth2Client() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'YouTube API credentials not found.\n' +
      'Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables.\n' +
      'Get credentials at: https://console.cloud.google.com/apis/credentials'
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
}

/**
 * Generate YouTube OAuth2 authorization URL.
 * @param {object} oauth2Client - Google OAuth2 client
 * @returns {string} Authorization URL to open in browser
 */
export function getYouTubeAuthUrl(oauth2Client) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: YOUTUBE_SCOPES,
    prompt: 'consent' // Force consent to always get refresh_token
  });
}

/**
 * Start local HTTP server to receive OAuth2 callback, exchange code for tokens.
 * Opens browser to auth URL, waits for redirect with code, exchanges and stores tokens.
 *
 * @param {object} oauth2Client - Google OAuth2 client
 * @returns {Promise<object>} Token data { access_token, refresh_token, expiry_date }
 */
export async function executeYouTubeAuthFlow(oauth2Client) {
  const authUrl = getYouTubeAuthUrl(oauth2Client);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
        if (url.pathname !== '/callback') {
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const code = url.searchParams.get('code');
        if (!code) {
          res.writeHead(400);
          res.end('No authorization code received');
          reject(new Error('No authorization code in callback'));
          return;
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store tokens
        await saveCredentials('youtube', {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>YouTube authentication successful!</h1><p>You can close this window.</p></body></html>');

        server.close();
        resolve(tokens);
      } catch (err) {
        res.writeHead(500);
        res.end('Authentication failed');
        server.close();
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      // Return authUrl for the caller to open
      server._authUrl = authUrl;
    });

    server.on('error', reject);

    // Timeout after 2 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out (2 minutes). Try again.'));
    }, 120000);
  });
}

/**
 * Get an authenticated YouTube OAuth2 client.
 * Loads stored tokens if available, otherwise returns null.
 *
 * @returns {Promise<object|null>} Authenticated OAuth2 client or null
 */
export async function getAuthenticatedYouTubeClient() {
  const tokens = await loadPlatformCredentials('youtube');
  if (!tokens) return null;

  const oauth2Client = createYouTubeOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });

  // googleapis will auto-refresh if token is expired
  return oauth2Client;
}

