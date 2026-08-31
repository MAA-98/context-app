import { UnixEntryName } from '../domain/unix-entry.js';
import { AppProps } from '../application/app-props.js';
import { getCwdAbsPath } from './get-cwd.js';
import { getDirLazyEntries } from './get-dir-lazy-entries.js';
import { createEmptyFoldNode } from '../application/fold/create-fold-node.js';

export async function loadInitialProps(): Promise<AppProps> {
  const rootAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(rootAddress);

  const firstEntry = lazyEntries[0];
  const initialCursorPath: UnixEntryName[] =
    firstEntry === undefined ? [] : [firstEntry.name];

  return {
    cwdAddress: rootAddress,
    initialView: {
      buffer: {
        entries: lazyEntries,
      },
      cursor: {
        kind: 'entry',
        path: initialCursorPath,
      },
      folds: createEmptyFoldNode(),
    },
  };
}
