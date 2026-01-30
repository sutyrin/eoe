#!/usr/bin/env node
import { program } from 'commander';
import { createCommand } from './commands/create.js';
import { devCommand } from './commands/dev.js';

program
  .name('eoe')
  .description('Engines of Experience - Creative atom toolkit')
  .version('1.0.0');

program.addCommand(createCommand);
program.addCommand(devCommand);

program.parse();
