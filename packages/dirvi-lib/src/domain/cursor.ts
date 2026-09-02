import { UnixEntryName, UnixEntryPath } from './unix-entry.js';
import { DisplayRow } from './display-row.js';

export type Cursor =
  | {
      kind: 'entry';
      parentPath: UnixEntryPath;
      entryName: UnixEntryName;
    }
  | {
      kind: 'fold';
      parentPath: UnixEntryPath;
    };

export const Cursor = {
  matchesDisplayRow(
    cursor: Cursor,
    row: DisplayRow,
  ): boolean {
    if (cursor.kind === 'entry' && row.kind === 'entry') {
      return (
        UnixEntryPath.equal(cursor.parentPath, row.parentPath) &&
        cursor.entryName === row.entry.name
      );
    }
    
    if (cursor.kind === 'fold' && row.kind === 'fold') {
      return UnixEntryPath.equal(cursor.parentPath, row.parentPath);
    }
    
    return false;
  },
  
  fromDisplayRow(row: DisplayRow): Cursor {
    if (row.kind === 'entry') {
      return {
        kind: 'entry',
        parentPath: row.parentPath,
        entryName: row.entry.name,
      };
    }
    
    return {
      kind: 'fold',
      parentPath: row.parentPath,
    };
  },
  
  getPath(cursor: Cursor): UnixEntryPath | undefined {
    if (cursor.kind === 'fold') {
      return undefined;
    }
    
    return [
      ...cursor.parentPath,
      cursor.entryName,
    ];
  }
}