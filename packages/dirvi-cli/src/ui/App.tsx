import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer, useRef, useState } from 'react';

import { Cursor, getDirLazyEntries, State } from 'dirvi-lib';
import type { UnixAbsolutePath } from 'dirvi-lib';

import { useView } from './hooks/useView.js';
import { reducer } from '../application/reducer.js';
import {
  userInputToInputResult,
  PendingInput,
} from '../infrastructure/input.js';
import { EventMessage } from '../domain/event-message.js';
import { ViewRowComponent } from './components/ViewRowComponent.js';

export type AppProps = {
  cwdAddress: UnixAbsolutePath;
  initialState: State;
  print?: (message: EventMessage) => void;
  onError?: (error: Error) => void;
};

export function App({ cwdAddress, initialState, print, onError }: AppProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const view = useView(state);

  const pendingInput = useRef<PendingInput | undefined>(undefined);
  const [exitStatus, setExitStatus] = useState<string | undefined>();

  // Print view on changes
  useEffect(() => {
    print?.({ type: 'view', view: state });
    // print?.({
    //   type: 'displayed-files-paths',
    //   paths: displayedFilePaths(displayRows),
    // });
  }, [state, print]);

  // --- Input ---
  useInput((input, key) => {
    const result = userInputToInputResult(
      input,
      key,
      state,
      pendingInput.current,
    );

    if (result === undefined) {
      return;
    }

    if (result === 'z') {
      pendingInput.current = result;
      return;
    }
    pendingInput.current = undefined;

    const action = result;

    // Contents of `updateDir` change meaning at this boundary:
    if (action.kind === 'updateDir') {
      // If the entry at the path is directory with no entries loaded:
      if (action.entries === undefined) {
        const path = Cursor.getPath(state.cursor);
        if (path === undefined) {
          return undefined;
        }
        const address = join(cwdAddress, ...path);
        void getDirLazyEntries(address)
          .then((entries) => {
            dispatch({
              kind: 'updateDir',
              path: path,
              entries,
            });
          })
          .catch((error: unknown) => {
            const appError =
              error instanceof Error ? error : new Error(String(error));

            onError?.(appError);
            setExitStatus(`Unable to open directory: ${appError.message}`);
          });
      } else {
        // Otherwise need to wipe the entries:
        dispatch({
          kind: 'updateDir',
          path: action.path,
          entries: undefined,
        });
      }
      return;
    }

    if (action.kind === 'printFile') {
      print?.({
        type: 'file',
        path: action.path,
      });

      return;
    }

    if (action.kind === 'exit') {
      setExitStatus(action.exitMessage);
    }

    dispatch(action);
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
