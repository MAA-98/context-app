import type { PosixCursor, PosixName, PosixNode } from 'dirvi-lib';

export type PosixEntryPath = PosixName[];

export type ReducerAction =
  | {
      kind: 'changeCursor';
      cursor: PosixCursor;
    }
  | {
      kind: 'updateDir';
      path: PosixEntryPath;
      entries: PosixNode[] | null; // null for unloaded
    }
  | {
      kind: 'fold';
      parentPath: PosixEntryPath;
      entry: PosixNode;
      cursor: PosixCursor;
    }
  | {
      kind: 'unfold';
      parentPath: PosixEntryPath;
      cursor: PosixCursor;
    };
