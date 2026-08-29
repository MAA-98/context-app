import type { Command } from 'commander';
import { homedir } from 'node:os';
import type { CreateWorkspace } from "../domain/contracts.js";

/**
 * `init`
 * Initializes a .repo-intents workspace in the current working directory
 * or in the user's home directory.
 */
export function registerInitCommand(
  program: Command,
  createWorkspace: CreateWorkspace,
) {
  program
    .command('init')
    .description('Initialize a .repo-intents workspace')
    .option('--global', 'Initialize ~/.repo-intents instead of the current directory')
    .action((opts: { global?: boolean }) => {
      const baseDir = opts.global ? homedir() : process.cwd();
      createWorkspace(baseDir)
    });
}