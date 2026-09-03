import { Text } from 'ink';

import { UnixAbsolutePath, State } from 'dirvi-lib';

import { EventMessage } from '../domain/event-message.js';
import { App } from './App.js';

// Represents state of directory being empty
export type EmptyView = {
  cursor: undefined;
};

export type ShellAppProps = {
  cwdAddress: UnixAbsolutePath;
  initialState: State | EmptyView;
  print?: (message: EventMessage) => void;
  onError?: (error: Error) => void;
};

export function AppShell({
  cwdAddress,
  initialState,
  print,
  onError,
}: ShellAppProps) {
  if (initialState.cursor === undefined) {
    return <Text dimColor>Directory is empty.</Text>;
  }

  return (
    <App
      cwdAddress={cwdAddress}
      initialState={initialState}
      print={print}
      onError={onError}
    />
  );
}
