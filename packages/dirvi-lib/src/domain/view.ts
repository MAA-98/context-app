import { UnixEntry } from './unix-entry.js';
import { DisplayRow } from './display-row.js';
import { FoldNode } from './fold.js';

export type Cursor = DisplayRow;

export type DirectoryBuffer = {
  entries: UnixEntry[];
};

export type View = {
  buffer: DirectoryBuffer;
  folds: FoldNode;
  cursor: Cursor;
};
