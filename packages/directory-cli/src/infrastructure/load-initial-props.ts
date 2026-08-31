import type { AppProps } from '../application/app-props.js';
import { getCwdAbsPath } from './get-cwd.js';
import { getDirLazyEntries } from './get-dir-lazy-entries.js';
import { createEmptyFoldNode } from '../application/fold/create-fold-node.js';
import { toDisplayEntry } from '../domain/view.js';

export async function loadInitialProps(): Promise<AppProps> {
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
        entry: toDisplayEntry(firstEntry),
      },
      folds: createEmptyFoldNode(),
    },
  };
}
