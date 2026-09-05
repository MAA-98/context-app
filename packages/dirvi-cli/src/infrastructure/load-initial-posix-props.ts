import { getCwdAbsPath, getDirLazyEntries, PosixFoldNodeApi } from 'dirvi-lib';
import type { PosixAppProps } from '../application/posix-app.js';

export async function loadInitialPosixProps(): Promise<PosixAppProps> {
  const cwdAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(cwdAddress);

  if (lazyEntries.length === 0) {
    return {
      cwdAddress,
      initialState: null,
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
        entryName: firstEntry.name,
      },
      foldNode: PosixFoldNodeApi.createEmpty(),
    },
  };
}
