import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer } from 'react';

import { getDirLazyEntries } from 'directory-app';

import { reducer } from '../application/reducer.js';
import type { State } from '../application/reducer.js';
import { inputToAction } from '../infrastructure/input.js';
import DirEntries from './components/dir-entries.js';

type Props = {
  initialState: State;
};

export function App({ initialState }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const { view, exitStatus } = state;
  const { buffer, cursor } = view;

  // --- Input ---
  useInput((input, key) => {
    const action = inputToAction(input, key, state);
    
    if (action === undefined) {
      return;
    }

    if (action.kind === 'expandDir') {
      const address = join(buffer.rootAddress, ...cursor);

      void getDirLazyEntries(address)
        .then((entries) => {
          dispatch({
            kind: 'directoryLoaded',
            path: cursor,
            entries,
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);

          dispatch({
            kind: 'exit',
            exitStatus: {
              exitMessage: `Unable to open directory: ${message}`,
            },
          });
        });

      return;
    }

    dispatch(action);
  });

  // --- Exit ---
  const { exit } = useApp();
  useEffect(() => {
    if (exitStatus !== undefined) {
      exit();
    }
  }, [exitStatus, exit]);

  // --- JSX ---
  if (exitStatus !== undefined) {
    return <Text>{exitStatus.exitMessage}</Text>;
  }

  return (
    <Box flexDirection="column">
      {buffer.entries.length === 0 ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        <DirEntries
          entries={buffer.entries}
          cursor={cursor}
          indent={0}
        />
      )}
    </Box>
  );
}
