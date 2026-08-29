#!/usr/bin/env node
import { Command } from 'commander';
import { registerInitCommand } from './commands/init.js';
import { registerAddCommand } from './commands/add.js';
import { registerEditCommand } from './commands/edit.js';
import { registerRunCommand } from './commands/run.js';
import { registerSearchCommand } from './commands/search.js';

import type {
  CreateWorkspace,
  DeleteIntentFromWorkspace,
  LoadIntentFromWorkspace,
  LoadIntentsFromWorkspace,
  ResolveWorkspaces,
  SaveIntentToWorkspace,
} from './domain/contracts.js';
import {
  createWorkspace,
  deleteIntentFromWorkspace,
  loadIntentFromWorkspaceFactory,
  loadIntentsFromWorkspaceFactory,
  resolveWorkspaces,
  saveIntentToWorkspace,
} from './infrastructure/node-workspace-methods.js';

import type { ValidateIntent, ValidateIntentBody } from './domain/contracts.js';
import {
  validateIntent,
  validateIntentBody,
} from './infrastructure/zod-validators.js';

import type {
  CreateTerminalSession,
  CollectPromptValues,
  RunShellCommand,
} from './application/contracts.js';
import { createTerminalSession } from './infrastructure/terminal-session.js';
import { collectPromptValues } from './infrastructure/collect-prompt-values.js';
import { runShellCommand } from './infrastructure/run-shell-cmd.js';
import { AppDeps } from './ui/domain/app-deps.js';

/**
 * Composition root for dependencies.
 */

validateIntent satisfies ValidateIntent;
validateIntentBody satisfies ValidateIntentBody;

const loadIntentFromWorkspace: LoadIntentFromWorkspace =
  loadIntentFromWorkspaceFactory(validateIntentBody);
const loadIntentsFromWorkspace: LoadIntentsFromWorkspace =
  loadIntentsFromWorkspaceFactory(loadIntentFromWorkspace);
createWorkspace satisfies CreateWorkspace;
resolveWorkspaces satisfies ResolveWorkspaces;

saveIntentToWorkspace satisfies SaveIntentToWorkspace;
deleteIntentFromWorkspace satisfies DeleteIntentFromWorkspace;

createTerminalSession satisfies CreateTerminalSession;
collectPromptValues satisfies CollectPromptValues;
runShellCommand satisfies RunShellCommand;

/**
 * Create CLI program
 */
const program = new Command();

program
  .name('repo-intents')
  .description('Create and search intents, run corresponding actions.')
  .version('0.1.0');

/**
 * Marshal deps for the React App (NOT the commands).
 */
const appDeps: AppDeps = {
  saveIntentToWorkspace,
  validateIntent,
  deleteIntentFromWorkspace,
};

/**
 * Command registration with dependencies.
 */
registerInitCommand(program, createWorkspace);
registerAddCommand(program, resolveWorkspaces, appDeps);
registerEditCommand(
  program,
  resolveWorkspaces,
  loadIntentFromWorkspace,
  appDeps,
);
registerRunCommand(
  program,
  resolveWorkspaces,
  loadIntentFromWorkspace,
  createTerminalSession,
  collectPromptValues,
  runShellCommand,
);
registerSearchCommand(
  program,
  resolveWorkspaces,
  loadIntentsFromWorkspace,
  createTerminalSession,
  collectPromptValues,
  runShellCommand,
  appDeps,
);

program.parseAsync(process.argv);
