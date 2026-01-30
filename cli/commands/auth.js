import { Command } from 'commander';
import chalk from 'chalk';

export const authCommand = new Command('auth')
  .argument('<platform>', 'Platform to authenticate with (youtube)')
  .description('Authenticate with a publishing platform')
  .action(async (platform) => {
    const validPlatforms = ['youtube'];
    if (!validPlatforms.includes(platform)) {
      console.error(chalk.red(`Platform "${platform}" not supported. Available: ${validPlatforms.join(', ')}`));
      process.exit(1);
    }

    await authYouTube();
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

