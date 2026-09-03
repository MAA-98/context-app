import {
  getCwdAbsPath,
  getDirLazyEntries,
  FoldNode,
  DisplayEntry,
} from 'dirvi-lib';
import { ShellAppProps } from '../ui/AppShell.js';

export async function loadInitialProps(): Promise<ShellAppProps> {
  const cwdAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(cwdAddress);

  if (lazyEntries.length === 0) {
    return {
      cwdAddress,
      initialState: {
        cursor: undefined,
      },
    };
  }

  const firstEntry = lazyEntries[0];

  if (firstEntry === undefined) {
    throw new Error(
      'Expected a first entry after checking that the directory is non-empty',
    );
  }

  return {
    cwdAddress,
    initialState: {
      buffer: lazyEntries,
      cursor: {
        kind: 'entry',
        parentPath: [],
        entryName: DisplayEntry.fromUnixEntry(firstEntry).name,
      },
      folds: FoldNode.createEmpty(),
    },
  };
}
