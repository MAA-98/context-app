import { Cursor, DirectoryBuffer, EntryPath, DisplayRow } from 'directory-app';
import { entryAtPath, namesEqual, pathsEqual } from './path-helpers.js';
import { UnixEntry } from 'directory-app';

export function pathInCursor(cursor: Cursor): EntryPath {
  return cursor.kind === 'entry' ? cursor.path : cursor.parentPath;
}

export function cursorMatchesRow(
  cursor: Cursor | undefined,
  row: DisplayRow,
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

export function cursorForRow(row: DisplayRow): Cursor {
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

export function entryAtCursor(
  buffer: DirectoryBuffer,
  cursor: Cursor,
): UnixEntry | undefined {
  return cursor.kind === 'entry' ? entryAtPath(buffer, cursor.path) : undefined;
}
