#!/usr/bin/env node
import { program } from 'commander';
import tabtab from 'tabtab';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { listCommand } from './commands/list.js';
import { noteCommand } from './commands/note.js';
import { statusCommand } from './commands/status.js';
import { completionCommand } from './commands/completion.js';
import { setupCompletion } from './lib/completion.js';

// Check for completion environment
const env = tabtab.parseEnv(process.env);
if (env.complete) {
  await setupCompletion(env);
  process.exit(0);
}

program
  .name('eoe')
  .description('Engines of Experience - Creative atom toolkit')
  .version('1.0.0');

program.addCommand(createCommand);
program.addCommand(devCommand);
program.addCommand(buildCommand);
program.addCommand(listCommand);
program.addCommand(noteCommand);
program.addCommand(statusCommand);
program.addCommand(completionCommand);

program.parse();
