import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useMemo, useReducer, useState } from 'react';

import { getDirLazyEntries, NavigationNode, State } from 'dirvi-lib';
import type { UnixAbsolutePath } from 'dirvi-lib';

import { useView } from './hooks/useView.js';
import { reducer } from '../application/reducer.js';
import { EventMessage } from '../domain/event-message.js';
import { ViewRowComponent } from './components/ViewRowComponent.js';
import { inkInputToUserInput } from '../infrastructure/user-input.js';
import { userInputToIntent } from '../application/user-input-to-intent.js';
import { Effect, intentToEffect } from '../application/intent-to-effect.js';
import { effectToAction } from '../application/effect-to-action.js';

export type AppProps = {
  cwdAddress: UnixAbsolutePath;
  initialState: State;
  print?: (message: EventMessage) => void;
  onError?: (error: Error) => void;
};

export function App({ cwdAddress, initialState, print, onError }: AppProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigation = useMemo(() => NavigationNode.from(state.buffer, state.folds), [state.buffer, state.folds]);
  const [commandBuffer, setCommandBuffer] = useState<string>('');
  const view = useView(navigation, state);
  const [exitStatus, setExitStatus] = useState<string | undefined>();

  // Print view on changes
  useEffect(() => {
    print?.({ type: 'view', view: state });
    
    const visibleFilesPaths = NavigationNode.visibleFilesPaths(navigation).map(
      (path) => join(cwdAddress, ...path),
    );
    print?.({
      type: 'displayed-files-paths',
      paths: visibleFilesPaths,
    });
  }, [state, print, navigation, cwdAddress]);
  
  function executeEffect(effect: Effect | undefined): void {
    if (effect === undefined) {
      return;
    }
    
    switch (effect.effectType) {
      case 'dispatchEffectAsAction':
        const action = effectToAction(effect.action, navigation, state);
        if (action === undefined) {
          return;
        }
        dispatch(action);
        return;

      case 'loadDir': {
        const address = join(cwdAddress, ...effect.path);

        void getDirLazyEntries(address)
          .then((entries) => {
            dispatch({
              kind: 'updateDir',
              path: effect.path,
              entries,
            });
          })
          .catch((error: unknown) => {
            const appError =
              error instanceof Error ? error : new Error(String(error));

            onError?.(appError);
            setExitStatus(`Unable to open directory: ${appError.message}`);
          });

        return;
      }

      case 'printFile':
        print?.({
          type: 'file',
          path: effect.path,
        });
        return;

      case 'exit':
        setExitStatus(effect.exitMessage);
        return;
    }
  }
  
  // --- Input Hook ---
  useInput((input, key) => {
    const userInput = inkInputToUserInput(input, key);
    if (userInput === undefined) {
      return;
    }
    
    const intent = userInputToIntent(userInput, commandBuffer);
    if (intent === undefined) {
      return
    }
    
    const effectResult = intentToEffect(intent, state)
    if (effectResult === undefined) {
      return
    }
    
    setCommandBuffer(effectResult.commandBuffer);
    executeEffect(effectResult.effect);
  });

  // --- Exit Logic ---
  const { exit } = useApp();
  useEffect(() => {
    if (exitStatus === undefined) {
      return;
    }

    if (exitStatus !== '') {
      onError?.(new Error(exitStatus));
    }

    exit();
  }, [exitStatus, exit, onError]);

  if (exitStatus !== undefined) {
    return null;
  }

  // --- JSX ---
  return (
    <Box flexDirection="column">
      {view.rows.length === 0 ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        view.rows.map((row) => (
          <ViewRowComponent key={row.id} row={row} />
        ))
      )}
    </Box>
  );
}
