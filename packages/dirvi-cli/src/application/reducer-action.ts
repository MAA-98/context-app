import { Cursor, UnixEntry, UnixEntryName, UnixEntryPath } from 'dirvi-lib';

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
      entryName: UnixEntryName;
    }
  | {
      kind: 'unfold';
      parentPath: UnixEntryPath;
      cursor: Cursor;
    };