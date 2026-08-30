import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer } from 'react';
import type { UnixEntry } from 'directory-app';
import { reducer, type State } from '../application/reducer.js';
import { inputToAction } from '../infrastructure/input.js';

function DirectoryEntry({
  entry,
  selected
}: {
  entry: UnixEntry,
  selected: boolean
}) {
  switch (entry.kind) {
    case 'file':
      return (
        <Text inverse={selected}>
          {entry.name}
        </Text>
      );

    case 'symlink':
      return (
        <Text inverse={selected}>
          {entry.name} -&gt; {entry.target}
        </Text>
      );

    case 'directory':
      return (
        <Text inverse={selected} color="blue">
          {entry.name}/
        </Text>
      );
  }
}

type Props = {
  initial: State;
};

export function App({ initial }: Props) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { buffer, view, exitStatus } = state;

  // --- Input ---
  useInput((input, key) => {
    const action = inputToAction(input, key);

    if (action !== undefined) {
      dispatch(action);
    }
  });

  // --- Exit ---
  const { exit } = useApp();
  useEffect(() => {
    if (exitStatus !== undefined) {
      exit();
    }
  }, [state, exit]);

  // --- JSX ---
  const cursorName = view.cursor[view.cursor.length - 1];
  
  if (exitStatus !== undefined) {
    return <Text>{exitStatus.exitMessage}</Text>;
  }

  return (
    <Box flexDirection="column">
      {buffer.entries.length === 0 ? (
        <Text dimColor>Directory is empty.</Text>
      ) : (
        buffer.entries.map((entry) => (
          <DirectoryEntry
            key={`${entry.kind}:${entry.name}`}
            entry={entry}
            selected={entry.name === cursorName}
          />
        ))
      )}
    </Box>
  );
}
