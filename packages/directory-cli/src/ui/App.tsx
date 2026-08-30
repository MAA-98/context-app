import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer } from 'react';

import { getDirLazyEntries } from 'directory-app';
import type { UnixEntry } from 'directory-app';

import { reducer } from '../application/reducer.js';
import type { State } from '../application/reducer.js';
import { inputToAction } from '../infrastructure/input.js';
import DirEntries from './components/dir-entries.js';

type Props = {
  initialState: State;
};

function getEntryAtPath(
  entries: UnixEntry[],
  path: string[],
): UnixEntry | undefined {
  const [currentName, ...remainingPath] = path;

  if (currentName === undefined) {
    return undefined;
  }

  const entry = entries.find(({ name }) => name === currentName);

  if (entry === undefined || remainingPath.length === 0) {
    return entry;
  }

  if (entry.kind !== 'directory' || entry.entries === undefined) {
    return undefined;
  }

  return getEntryAtPath(entry.entries, remainingPath);
}

export function App({ initialState }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const { view, exitStatus } = state;
  const { buffer, cursor } = view;

  // --- Input ---
  useInput((input, key) => { // TODO: Clean up below
    const action = inputToAction(input, key);
    
    if (action === undefined) {
      return;
    }

    if (action.kind === 'expandDir') {
      const selectedEntry = getEntryAtPath(buffer.entries, view.cursor);

      if (selectedEntry?.kind !== 'directory') {
        return;
      }

      // Already expanded.
      if (selectedEntry.entries !== undefined) {
        return;
      }

      const address = join(buffer.rootAddress, ...view.cursor);

      void getDirLazyEntries(address)
        .then((entries) => {
          dispatch({
            kind: 'directoryLoaded',
            path: view.cursor,
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
  }, [state, exit]);

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
          cursor={view.cursor}
          indent={0}
        />
      )}
    </Box>
  );
}
