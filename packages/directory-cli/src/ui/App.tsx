import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer, useRef, useState } from 'react';

import { getDirLazyEntries } from 'directory-app';
import type { AppProps } from 'directory-app';

import { reducer } from '../application/reducer.js';
import { inputToInputResult, PendingInput } from '../infrastructure/input.js';
import DirEntries from './components/DirEntries.js';

export function App({ rootAddress, initialView }: AppProps) {
  const [view, dispatch] = useReducer(reducer, initialView);
  const [exitStatus, setExitStatus] = useState<string | undefined>();
  const pendingInput = useRef<PendingInput | undefined>(undefined);
  
  const { buffer, cursor, folds } = view;

  // --- Input ---
  useInput((input, key) => {
    const result = inputToInputResult(input, key, view, pendingInput.current);
    
    if (result === 'z') {
      pendingInput.current = result;
      return;
    }
    
    pendingInput.current = undefined;
    
    if (result === undefined) {
      return;
    }
    
    const action = result;

    if (action.kind === 'expandDir') {
      const address = join(rootAddress, ...action.path);

      void getDirLazyEntries(address)
        .then((entries) => {
          dispatch({
            kind: 'directoryLoaded',
            path: action.path,
            entries,
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);
          
          setExitStatus(`Unable to open directory: ${message}`);
        });

      return;
    }
    
    if (action.kind === 'exit') {
      setExitStatus(action.exitMessage)
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
    return <Text>{exitStatus}</Text>;
  }

  return (
    <Box flexDirection="column">
      {buffer.entries.length === 0 ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        <DirEntries
          entries={buffer.entries}
          foldNode={folds}
          cursor={cursor}
          indent={0}
          path={[]}
        />
      )}
    </Box>
  );
}
