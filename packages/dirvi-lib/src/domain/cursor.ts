import { PosixName, UnixEntryPath } from './unix-entry.js';

export type Cursor =
  | {
      kind: 'entry';
      parentPath: UnixEntryPath;
      entryName: PosixName;
    }
  | {
      kind: 'fold';
      parentPath: UnixEntryPath;
    };

export const Cursor = {
  equal(left: Cursor, right: Cursor): boolean {
    if (left.kind !== right.kind) {
      return false;
    }

    if (!UnixEntryPath.equal(left.parentPath, right.parentPath)) {
      return false;
    }

    if (left.kind === 'entry' && right.kind === 'entry') {
      return left.entryName === right.entryName;
    }

    return true;
  },

  getPath(cursor: Cursor): UnixEntryPath | undefined {
    if (cursor.kind === 'fold') {
      return undefined;
    }

    return [...cursor.parentPath, cursor.entryName];
  },
};
