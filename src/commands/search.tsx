import type { Command } from 'commander';
import { render } from 'ink';
import type {Intent} from "../domain/types.js";
import type {LoadIntentsFromWorkspace, ResolveWorkspaces} from "../domain/contracts.js";
import { App } from '../ui/App.js';
import {runIntent} from "../application/run-intent.js";
import {CreateTerminalSession, CollectPromptValues, RunShellCommand} from "../application/contracts.js";
import { AppDeps } from '../ui/domain/app-deps.js';

export function registerSearchCommand(
  program: Command,
  resolveWorkspaces: ResolveWorkspaces,
  loadIntentsFromWorkspace: LoadIntentsFromWorkspace,
  createTerminalSession: CreateTerminalSession,
  collectPromptValues: CollectPromptValues,
  runShellCommand: RunShellCommand,
  appDeps: AppDeps,
) {
  program
    .command('search [query]')
    .description('Interactively search available intents')
    .action(async (query?: string) => {
      const workspaces = resolveWorkspaces(process.cwd());

      if (workspaces.length === 0) {
        console.error(
          'No .repo-intents workspaces found. Run `init` or `init --global` first.',
        );
        process.exit(1);
      }

      const intents = workspaces.flatMap((workspace) =>
        loadIntentsFromWorkspace(workspace),
      );

      let submittedIntent: Intent | undefined;

      // --- SEARCH SCREEN ---
      const app = render(
        <App
          initial={{
            kind: 'SearchIntents',
            intents,
            initialQuery: query ?? '',
            onSubmit: (intent) => {
              submittedIntent = intent;
            },
          }}
          deps={appDeps}
        />,
      );

      await app.waitUntilExit();

      if (submittedIntent) {
        await runIntent(
          submittedIntent,
          createTerminalSession,
          collectPromptValues,
          runShellCommand,
        );
      }
    });
}