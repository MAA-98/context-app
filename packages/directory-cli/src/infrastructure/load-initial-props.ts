import { getCwdAbsPath, getDirLazyEntries, unixEntryToDisplayEntry, createEmptyFoldNode } from 'directory-app';
import { ShellAppProps } from '../ui/AppShell.js';

export async function loadInitialProps(): Promise<ShellAppProps> {
  const cwdAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(cwdAddress);

  if (lazyEntries.length === 0) {
    return {
      cwdAddress,
      initialView: {
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
    initialView: {
      buffer: {
        entries: lazyEntries,
      },
      cursor: {
        kind: 'entry',
        parentPath: [],
        entry: unixEntryToDisplayEntry(firstEntry),
      },
      folds: createEmptyFoldNode(),
    },
  };
}
