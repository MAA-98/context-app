import { Text } from 'ink';

import { AppProps, UnixAbsolutePath, View } from 'directory-app';
import { App } from './App.js';

// Represents state of directory being empty
export type EmptyView = {
  cursor: undefined;
};

export type ShellAppProps = {
  cwdAddress: UnixAbsolutePath;
  initialView: View | EmptyView;
};

export function AppShell({ cwdAddress, initialView }: ShellAppProps) {
  if (initialView.cursor === undefined) {
    return <Text dimColor>Directory is empty.</Text>;
  }

  return <App cwdAddress={cwdAddress} initialView={initialView} />;
}
