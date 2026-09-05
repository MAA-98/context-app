import type { PosixState, UnixAbsolutePath } from 'dirvi-lib';

// Null initial state represents state of directory being empty.
export type PosixAppProps = {
  cwdAddress: UnixAbsolutePath;
  initialState: PosixState | null;
};
