#!/usr/bin/env node
import { program } from 'commander';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';
import { buildCommand } from './commands/build.js';
import { noteCommand } from './commands/note.js';
import { statusCommand } from './commands/status.js';

program
  .name('eoe')
  .description('Engines of Experience - Creative atom toolkit')
  .version('1.0.0');

program.addCommand(createCommand);
program.addCommand(devCommand);
program.addCommand(buildCommand);
program.addCommand(noteCommand);
program.addCommand(statusCommand);

program.parse();
