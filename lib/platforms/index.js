export { uploadToYouTube } from './youtube-client.js';
export { uploadToTikTok } from './tiktok-client.js';
export {
  createYouTubeOAuth2Client,
  getYouTubeAuthUrl,
  executeYouTubeAuthFlow,
  getAuthenticatedYouTubeClient,
  getTikTokAccessToken
} from './oauth-manager.js';
