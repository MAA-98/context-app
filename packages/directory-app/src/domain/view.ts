import type { UnixEntry, UnixEntryName } from './unix-entry.js';

export type DirectoryBuffer = {
  entries: UnixEntry[];
};

export type EntryPath = UnixEntryName[];

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[];
};

export type VisibleRow =
  | {
      kind: 'entry';
      path: EntryPath;
      entry: UnixEntry;
      indent: number;
    }
  | {
      kind: 'fold';
      parentPath: EntryPath;
      entryNames: UnixEntryName[];
      indent: number;
    };

export type Cursor =
  | {
      kind: 'entry';
      path: EntryPath;
    }
  | {
      kind: 'fold';
      parentPath: EntryPath;
      entryNames: UnixEntryName[];
    };

export type View = {
  buffer: DirectoryBuffer;
  folds: FoldNode;
  cursor: Cursor;
};