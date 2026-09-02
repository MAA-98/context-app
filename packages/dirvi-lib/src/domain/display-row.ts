import { UnixEntry, UnixEntryName, UnixEntryPath } from './unix-entry.js';
import { entryNamesEqual } from './unix-entry.js';
import type { UnixPath } from './unix-path.js';

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

export const DisplayEntry = {
  fromUnixEntry(entry: UnixEntry): DisplayEntry {
    if (entry.kind === 'directory') {
      return {
        kind: 'directory',
        name: entry.name,
      };
    }
    
    return entry;
  }
}

export type DisplayRow =
  | {
      kind: 'entry';
      parentPath: UnixEntryPath;
      entry: DisplayEntry;
    }
  | {
      kind: 'fold';
      parentPath: UnixEntryPath;
      entryNames: UnixEntryName[];
    };

export const DisplayRow = {
  equal(firstRow: DisplayRow, secondRow: DisplayRow): boolean {
    if (firstRow.kind !== secondRow.kind) {
      return false;
    }

    if (firstRow.kind === 'fold' && secondRow.kind === 'fold') {
      return (
        UnixEntryPath.equal(firstRow.parentPath, secondRow.parentPath) &&
        entryNamesEqual(firstRow.entryNames, secondRow.entryNames)
      );
    }

    if (firstRow.kind === 'entry' && secondRow.kind === 'entry') {
      return (
        UnixEntryPath.equal(firstRow.parentPath, secondRow.parentPath) &&
        firstRow.entry.name === secondRow.entry.name
      );
    }

    return false;
  },
};
