import { Command } from 'commander';
import tabtab from 'tabtab';
import chalk from 'chalk';
import { setupCompletion } from '../lib/completion.js';

const completionBase = new Command('completion')
  .description('Manage shell completion');

const installCommand = new Command('install')
  .argument('<shell>', 'Shell type (bash or zsh)')
  .description('Install completion for bash or zsh')
  .action(async (shell) => {
    try {
      await tabtab.install({
        name: 'eoe',
        completer: 'eoe'
      });
      console.log(chalk.green(`✓ Completion installed for ${shell}`));
      console.log(chalk.gray('Restart your shell or run: source ~/.bashrc (or ~/.zshrc)'));
    } catch (err) {
      console.error(chalk.red(`Failed to install completion: ${err.message}`));
      process.exit(1);
    }
  });

const uninstallCommand = new Command('uninstall')
  .description('Remove completion')
  .action(async () => {
    try {
      await tabtab.uninstall({ name: 'eoe' });
      console.log(chalk.green('✓ Completion uninstalled'));
    } catch (err) {
      console.error(chalk.red(`Failed to uninstall: ${err.message}`));
      process.exit(1);
    }
  });

export const completionCommand = completionBase
  .addCommand(installCommand)
  .addCommand(uninstallCommand)
  .action(async () => {
    const env = tabtab.parseEnv(process.env);

    // If called for completion, handle it
    if (env.complete) {
      return setupCompletion(env);
    }

    // Otherwise, show installation instructions
    console.log(chalk.blue('Shell Completion Setup\n'));
    console.log('Install completion for your shell:\n');
    console.log(chalk.yellow('  Bash:'));
    console.log('    eoe completion install bash');
    console.log('');
    console.log(chalk.yellow('  Zsh:'));
    console.log('    eoe completion install zsh');
    console.log('');
    console.log('Uninstall completion:');
    console.log('  eoe completion uninstall');
  });
