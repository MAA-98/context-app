import { Cursor, UnixEntry, UnixEntryPath } from 'dirvi-lib';

export type ReducerAction =
  | {
      kind: 'changeCursor';
      cursor: Cursor;
    }
  | {
      kind: 'updateDir';
      path: UnixEntryPath;
      entries: UnixEntry[] | undefined;
    }
  | {
      kind: 'fold';
      parentPath: UnixEntryPath;
      entry: UnixEntry;
      cursor: Cursor;
    }
  | {
      kind: 'unfold';
      parentPath: UnixEntryPath;
      cursor: Cursor;
    };