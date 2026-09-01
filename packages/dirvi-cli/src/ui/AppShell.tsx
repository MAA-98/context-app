import { Text } from 'ink';

import { UnixAbsolutePath, View } from 'dirvi-lib';

import { App } from './App.js';
import { PrintMessage } from '../domain/print-message.js';

// Represents state of directory being empty
export type EmptyView = {
  cursor: undefined;
};

export type ShellAppProps = {
  cwdAddress: UnixAbsolutePath;
  initialView: View | EmptyView;
  print?: (message: PrintMessage) => void;
  onError?: (error: Error) => void;
};

export function AppShell({ cwdAddress, initialView, print, onError }: ShellAppProps) {
  if (initialView.cursor === undefined) {
    return <Text dimColor>Directory is empty.</Text>;
  }

  return (
    <App
      cwdAddress={cwdAddress}
      initialView={initialView}
      print={print}
      onError={onError}
    />
  );
}
