import type { UnixEntry, UnixEntryName } from './unix-entry.js';
import { entryNamesEqual } from './unix-entry.js';
import type { UnixPath } from './unix-path.js';

export type EntryPath = UnixEntryName[];

export function pathsEqual(left: EntryPath, right: EntryPath): boolean {
  return entryNamesEqual(left, right);
}

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

export function unixEntryToDisplayEntry(entry: UnixEntry): DisplayEntry {
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
      entryNamesEqual(firstRow.entryNames, secondRow.entryNames)
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