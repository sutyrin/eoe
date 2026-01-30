import { Command } from 'commander';
import chalk from 'chalk';

export const authCommand = new Command('auth')
  .argument('<platform>', 'Platform to authenticate with (youtube, tiktok)')
  .description('Authenticate with a publishing platform')
  .action(async (platform) => {
    const validPlatforms = ['youtube', 'tiktok'];
    if (!validPlatforms.includes(platform)) {
      console.error(chalk.red(`Platform "${platform}" not supported. Available: ${validPlatforms.join(', ')}`));
      process.exit(1);
    }

    if (platform === 'youtube') {
      await authYouTube();
    } else if (platform === 'tiktok') {
      await authTikTok();
    }
  });

async function authYouTube() {
  try {
    const { createYouTubeOAuth2Client, executeYouTubeAuthFlow, getYouTubeAuthUrl } = await import('../../lib/platforms/oauth-manager.js');

    console.log(chalk.blue('Authenticating with YouTube...'));
    console.log(chalk.gray('A browser window will open for you to grant access.\n'));

    const oauth2Client = createYouTubeOAuth2Client();
    const authUrl = getYouTubeAuthUrl(oauth2Client);

    console.log(chalk.gray(`If the browser doesn't open, visit this URL:\n${authUrl}\n`));

    // Open browser
    const open = (await import('open')).default;
    await open(authUrl);

    // Wait for callback
    const tokens = await executeYouTubeAuthFlow(oauth2Client);

    console.log(chalk.green('\nYouTube authentication successful!'));
    console.log(chalk.gray('Credentials saved. You can now use `eoe publish`.'));

  } catch (err) {
    if (err.message.includes('YOUTUBE_CLIENT_ID')) {
      console.error(chalk.red('\nYouTube API credentials not configured.'));
      console.error(chalk.gray('1. Go to https://console.cloud.google.com/apis/credentials'));
      console.error(chalk.gray('2. Create an OAuth 2.0 Client ID'));
      console.error(chalk.gray('3. Set environment variables:'));
      console.error(chalk.gray('   export YOUTUBE_CLIENT_ID="your-client-id"'));
      console.error(chalk.gray('   export YOUTUBE_CLIENT_SECRET="your-client-secret"'));
    } else {
      console.error(chalk.red(`\nAuthentication failed: ${err.message}`));
    }
    process.exit(1);
  }
}

async function authTikTok() {
  // TikTok auth is more manual due to API complexity
  // For now, accept a token directly
  console.log(chalk.blue('TikTok Authentication Setup'));
  console.log();
  console.log(chalk.gray('TikTok requires developer app registration:'));
  console.log(chalk.gray('1. Go to https://developers.tiktok.com/'));
  console.log(chalk.gray('2. Create an app with Content Posting API scope'));
  console.log(chalk.gray('3. Complete OAuth flow to get access token'));
  console.log(chalk.gray('4. Run: eoe auth tiktok --token <your-access-token>'));
  console.log();
  console.log(chalk.yellow('Note: Videos from unverified apps are private-only until audit approval.'));

  // Check if --token flag was passed (Commander doesn't support this natively on the parent,
  // so we check process.argv directly)
  const tokenIdx = process.argv.indexOf('--token');
  if (tokenIdx !== -1 && process.argv[tokenIdx + 1]) {
    const token = process.argv[tokenIdx + 1];
    const { saveCredentials } = await import('../../lib/utils/credentials.js');
    await saveCredentials('tiktok', { access_token: token });
    console.log(chalk.green('\nTikTok token saved successfully!'));
    console.log(chalk.gray('You can now use `eoe publish --platform tiktok`.'));
  }
}
