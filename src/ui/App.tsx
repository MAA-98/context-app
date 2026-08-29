import { useEffect, useState } from 'react';
import { Text, useApp } from 'ink';

import { Screen } from './domain/screen.js';
import { IntentEditorScreen } from './screens/IntentEditorScreen.js';
import { SearchIntentsScreen } from './screens/SearchIntentsScreen.js';
import { AppDeps } from './domain/app-deps.js';

type Props = {
  initial: Screen;
  deps: AppDeps;
};

type ExitState = {
  shouldExit: boolean;
  message?: string;
};

export function App({ initial, deps }: Props) {
  const [screen, setScreen] = useState<Screen>(initial);
  const { exit } = useApp();
  // Need exit state to have a single step to render before quiting app:
  const [exitState, setExitState] = useState<ExitState>({
    shouldExit: false,
  });
  useEffect(() => {
    if (exitState.shouldExit) {
      exit();
    }
  }, [exitState, exit]);

  // Screen before exiting:
  if (exitState.shouldExit) {
    if (!exitState.message) {
      return null;
    }
    return <Text>{exitState.message}</Text>;
  }

  if (screen.kind === 'IntentEditor') {
    return (
      <IntentEditorScreen
        workspace={screen.workspace}
        draft={screen.draft}
        validateIntent={deps.validateIntent}
        saveIntentToWorkspace={deps.saveIntentToWorkspace}
        deleteIntentFromWorkspace={deps.deleteIntentFromWorkspace}
        onExit={(message) => setExitState({ shouldExit: true, message })}
      />
    );
  }

  if (screen.kind === 'SearchIntents') {
    return (
      <SearchIntentsScreen
        intents={screen.intents}
        initialQuery={screen.initialQuery}
        onSubmit={(intent) => {
          screen.onSubmit(intent);
          setExitState({ shouldExit: true });
        }}
        onEdit={(intent) => {
          setScreen({
            kind: 'IntentEditor',
            workspace: intent.workspace,
            draft: intent,
          })
        }}
        onExit={(message) => setExitState({ shouldExit: true, message })}
      />
    );
  }
}
