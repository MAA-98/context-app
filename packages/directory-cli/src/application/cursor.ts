import { Cursor, EntryPath, VisibleRow } from '../domain/view.js';
import { UnixEntryName } from 'directory-app';

export function pathAtCursor(cursor: Cursor): EntryPath {
  return cursor.kind === 'entry' ? cursor.path : cursor.parentPath;
}

export function cursorMatchesRow(
  cursor: Cursor | undefined,
  row: VisibleRow,
): boolean {
  if (cursor === undefined) {
    return false;
  }

  if (cursor.kind !== row.kind) {
    return false;
  }

  if (row.kind === 'entry' && cursor.kind === 'entry') {
    return pathsEqual(cursor.path, row.path);
  }

  if (row.kind === 'fold' && cursor.kind === 'fold') {
    return (
      pathsEqual(cursor.parentPath, row.parentPath) &&
      namesEqual(cursor.entryNames, row.entryNames)
    );
  }

  return false;
}

export function pathsEqual(left: EntryPath, right: EntryPath): boolean {
  return namesEqual(left, right);
}

export function namesEqual(left: UnixEntryName[], right: UnixEntryName[]): boolean {
  return (
    left.length === right.length &&
    left.every((name, index) => name === right[index])
  );
}

export function cursorForRow(row: VisibleRow): Cursor {
  if (row.kind === 'entry') {
    return {
      kind: 'entry',
      path: row.path,
    };
  }

  return {
    kind: 'fold',
    parentPath: row.parentPath,
    entryNames: row.entryNames,
  };
}