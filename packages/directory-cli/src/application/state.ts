import type { UnixDirectory, UnixEntryName } from 'directory-app';

export type EntryPath = UnixEntryName[];
export type Cursor = EntryPath;

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[]
};

export type View = {
  buffer: UnixDirectory;
  cursor: Cursor;
  folds: FoldNode;
};

export type ExitStatus = {
  exitMessage: string;
};

export type State = {
  view: View;
  exitStatus?: ExitStatus;
};