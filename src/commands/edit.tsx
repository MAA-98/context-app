import type { Command } from 'commander';
import { render } from 'ink';
import type {
  LoadIntentFromWorkspace,
  ResolveWorkspaces,
  SaveIntentToWorkspace,
  ValidateIntent,
} from '../domain/contracts.js';
import { resolveIntentById } from '../application/resolve-intent.js';
import { App } from '../ui/App.js';
import { AppDeps } from '../ui/domain/app-deps.js';

export function registerEditCommand(
  program: Command,
  resolveWorkspaces: ResolveWorkspaces,
  loadIntentFromWorkspace: LoadIntentFromWorkspace,
  appDeps: AppDeps,
) {
  program
    .command('edit <id>')
    .description('Edit an intent in the current workspace')
    .action(async (id: string) => {
      // --- FIND INTENT ---
      const workspaces = resolveWorkspaces(process.cwd());

      if (workspaces.length === 0) {
        console.error(
          'No .repo-intents workspace found. Run `init` or `init --global` first.',
        );
        process.exit(1);
      }

      const resolvedResult = resolveIntentById(
        workspaces,
        id,
        loadIntentFromWorkspace,
      );

      if (!resolvedResult) {
        console.error(`No intent found with id "${id}".`);
        process.exit(1);
      }

      const { workspace, intent } = resolvedResult;

      // --- EDITOR ---
      const app = render(
        <App
          initial={{
            kind: 'IntentEditor',
            workspace,
            draft: intent,
          }}
          deps={appDeps}
        />,
      );
      await app.waitUntilExit();
    });
}
