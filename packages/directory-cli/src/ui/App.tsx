import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer, useRef, useState } from 'react';

import { getDirLazyEntries } from 'directory-app';
import type { UnixAbsolutePath, View } from 'directory-app';

import { reducer } from '../application/reducer.js';
import { inputToInputResult, PendingInput } from '../infrastructure/input.js';
import DirEntries from './components/DirEntries.js';
import { createDisplayRows } from '../application/display-rows.js';
import { PrintMessage } from '../domain/print-message.js';

export type AppProps = {
  cwdAddress: UnixAbsolutePath;
  initialView: View;
  print?: (message: PrintMessage) => void;
  onError?: (error: Error) => void;
};

export function App({ cwdAddress, initialView, print, onError }: AppProps) {
  const [view, dispatch] = useReducer(reducer, initialView);
  const [exitStatus, setExitStatus] = useState<string | undefined>();
  const pendingInput = useRef<PendingInput | undefined>(undefined);

  const { buffer, folds, cursor } = view;
  
  // Print view on changes
  useEffect(() => {
    print?.({ type: 'view', view: view });
  }, [view, print]);
  
  // --- Input ---
  useInput((input, key) => {
    const result = inputToInputResult(input, key, view, pendingInput.current);
    
    if (result === undefined) {
      return;
    }
    
    if (result === 'z') {
      pendingInput.current = result;
      return;
    }
    pendingInput.current = undefined;
    
    const action = result;
    if (action.kind === 'expandDir') {
      const address = join(cwdAddress, ...action.path);

      void getDirLazyEntries(address)
        .then((entries) => {
          dispatch({
            kind: 'directoryLoaded',
            path: action.path,
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
    
    if (action.kind === 'printFilepath') {
      const address = join(cwdAddress, ...action.path);

      print?.({
        type: 'filepath',
        path: address,
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
    return null
  }

  // --- JSX ---
  const displayRows = createDisplayRows(buffer, folds);
  
  return (
    <Box flexDirection="column">
      {(buffer.entries.length === 0 || cursor === undefined) ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        <DirEntries
          rows={displayRows}
          cursor={cursor}
        />
      )}
    </Box>
  );
}