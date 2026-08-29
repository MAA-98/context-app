import type { Command } from 'commander';
import { render } from 'ink';
import type {
  ResolveWorkspaces,
  SaveIntentToWorkspace,
  ValidateIntent,
} from '../domain/contracts.js';
import { App } from '../ui/App.js';
import { AppDeps } from '../ui/domain/app-deps.js';

export function registerAddCommand(
  program: Command,
  resolveWorkspaces: ResolveWorkspaces,
  appDeps: AppDeps,
) {
  program
    .command('add')
    .description('Create a new intent in the current workspace')
    .action(async () => {
      // --- FIND WORKSPACE ---
      const workspaces = resolveWorkspaces(process.cwd());
      const workspace = workspaces[0];

      if (!workspace) {
        console.error(
          'No .repo-intents workspace found. Run `init` or `init --global` first.',
        );
        process.exit(1);
      }

      // --- EDITOR ---
      const app = render(
        <App
          initial={{
            kind: 'IntentEditor',
            workspace,
          }}
          deps={appDeps}
        />,
      );
      await app.waitUntilExit();
    });
}
