import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer, useRef, useState } from 'react';

import { Cursor, DisplayRow, getDirLazyEntries } from 'dirvi-lib';
import type { UnixAbsolutePath, View } from 'dirvi-lib';

import { reducer } from '../application/reducer.js';
import { userInputToInputResult, PendingInput } from '../infrastructure/input.js';
import DirEntries from './components/DirEntries.js';
import { createDisplayRows } from '../application/display-rows.js';
import { EventMessage } from '../domain/event-message.js';
import * as path from 'node:path';

export type AppProps = {
  cwdAddress: UnixAbsolutePath;
  initialView: View;
  print?: (message: EventMessage) => void;
  onError?: (error: Error) => void;
};

export function App({ cwdAddress, initialView, print, onError }: AppProps) {
  const [view, dispatch] = useReducer(reducer, initialView);
  const { buffer, folds, cursor } = view;
  const displayRows = createDisplayRows(buffer, folds);

  const pendingInput = useRef<PendingInput | undefined>(undefined);
  const [exitStatus, setExitStatus] = useState<string | undefined>();

  // Print view on changes
  useEffect(() => {
    print?.({ type: 'view', view: view });
    print?.({
      type: 'displayed-files-paths',
      paths: displayedFilePaths(displayRows),
    });
  }, [view, print]);

  // --- Input ---
  useInput((input, key) => {
    const result = userInputToInputResult(input, key, view, pendingInput.current);

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
        const path = Cursor.getPath(view.cursor)
        if (path === undefined) {
          return undefined
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
          entries: undefined
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
      {buffer.entries.length === 0 || cursor === undefined ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        <DirEntries rows={displayRows} cursor={cursor} />
      )}
    </Box>
  );
}

export function displayedFilePaths(rows: readonly DisplayRow[]): string[] {
  return rows.flatMap((row) => {
    if ((row.kind !== 'entry') || (row.entry.kind !== 'file')) {
      return [];
    }
    
    return [
      path.posix.join(...row.parentPath.map(String), String(row.entry.name)),
    ];
  });
}