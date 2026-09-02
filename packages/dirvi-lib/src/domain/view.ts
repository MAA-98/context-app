import { UnixEntry } from './unix-entry.js';
import type { FoldNode } from './fold-node.js';
import { Cursor } from './cursor.js';

export type DirectoryBuffer = {
  entries: UnixEntry[];
};

export type View = {
  buffer: DirectoryBuffer;
  folds: FoldNode;
  cursor: Cursor;
};

export const View = {
  getEntryAtCursor(view: View): UnixEntry | undefined {
    const path = Cursor.getPath(view.cursor);

    // Nothing on folds
    if (path === undefined) {
      return undefined;
    }

    return UnixEntry.getEntryAtPath(view.buffer.entries, path);
  }
}
