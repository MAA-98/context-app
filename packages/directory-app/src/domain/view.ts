import type { UnixEntry, UnixEntryName, UnixPath } from './unix-entry.js';

export type DirectoryBuffer = {
  entries: UnixEntry[];
};

export type EntryPath = UnixEntryName[];

export function namesEqual(
  left: UnixEntryName[],
  right: UnixEntryName[],
): boolean {
  return (
    left.length === right.length &&
    left.every((name, index) => name === right[index])
  );
}

export function pathsEqual(left: EntryPath, right: EntryPath): boolean {
  return namesEqual(left, right);
}

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[];
};

export type DisplayEntry =
  | {
      kind: 'file';
      name: UnixEntryName;
    }
  | {
      kind: 'symlink';
      name: UnixEntryName;
      target: UnixPath;
    }
  | {
      kind: 'directory';
      name: UnixEntryName;
    };

export function toDisplayEntry(entry: UnixEntry): DisplayEntry {
  if (entry.kind === 'directory') {
    return {
      kind: 'directory',
      name: entry.name,
    };
  }

  return entry;
}

export type DisplayRow =
  | {
      kind: 'entry';
      parentPath: EntryPath;
      entry: DisplayEntry;
    }
  | {
      kind: 'fold';
      parentPath: EntryPath;
      entryNames: UnixEntryName[];
    };

export function rowsEqual(
  firstRow: DisplayRow,
  secondRow: DisplayRow,
): boolean {
  if (firstRow.kind !== secondRow.kind) {
    return false;
  }

  if (firstRow.kind === 'fold' && secondRow.kind === 'fold') {
    return (
      pathsEqual(firstRow.parentPath, secondRow.parentPath) &&
      namesEqual(firstRow.entryNames, secondRow.entryNames)
    );
  }

  if (firstRow.kind === 'entry' && secondRow.kind === 'entry') {
    return (
      pathsEqual(firstRow.parentPath, secondRow.parentPath) &&
      firstRow.entry.name === secondRow.entry.name
    );
  }

  return false;
}

export type Cursor = DisplayRow;

export type View = {
  buffer: DirectoryBuffer;
  folds: FoldNode;
  cursor: Cursor;
};