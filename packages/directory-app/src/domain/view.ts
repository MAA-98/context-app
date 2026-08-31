import { UnixEntry, UnixEntryName } from './unix-entry.js';
import { DisplayRow } from './display-row.js';

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[];
};

export function createEmptyFoldNode(): FoldNode {
  return {
    children: Object.create(null) as Record<string, FoldNode>,
    folds: [],
  };
}

export type Cursor = DisplayRow;

export type DirectoryBuffer = {
  entries: UnixEntry[];
};

export type View = {
  buffer: DirectoryBuffer;
  folds: FoldNode;
  cursor: Cursor;
};