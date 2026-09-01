import {
  DirectoryBuffer,
  DisplayRow,
  EntryPath,
  FoldNode, pathsEqual,
  UnixEntry,
  UnixEntryName,
} from 'dirvi-lib';

import { hasFold } from './fold-helpers.js';

function displayRowsAtPath(
  entries: UnixEntry[],
  path: EntryPath,
  foldNode: FoldNode | undefined,
): DisplayRow[] {
  const rows: DisplayRow[] = [];
  let index = 0;

  while (index < entries.length) {
    const entry = entries[index];

    if (foldNode !== undefined && hasFold(foldNode, entry.name)) {
      const entryNames: UnixEntryName[] = [];

      while (index < entries.length && hasFold(foldNode, entries[index].name)) {
        entryNames.push(entries[index].name);
        index += 1;
      }

      rows.push({
        kind: 'fold',
        parentPath: path,
        entryNames,
      });

      continue;
    }

    rows.push({
      kind: 'entry',
      parentPath: path,
      entry,
    });

    if (entry.kind === 'directory' && entry.entries !== undefined) {
      rows.push(
        ...displayRowsAtPath(
          entry.entries,
          [...path, entry.name],
          foldNode?.children[entry.name],
        ),
      );
    }

    index += 1;
  }

  return rows;
}

export function createDisplayRows(
  buffer: DirectoryBuffer,
  folds: FoldNode,
): DisplayRow[] {
  return displayRowsAtPath(buffer.entries, [], folds);
}

export function displayRowAtPath(
  buffer: DirectoryBuffer,
  folds: FoldNode,
  path: EntryPath,
): DisplayRow | undefined {
  if (path.length === 0) {
    return undefined;
  }

  const rows = createDisplayRows(buffer, folds);
  const parentPath = path.slice(0, -1);
  const entryName = path[path.length - 1];

  return rows.find((row) => {
    if (row.kind === 'entry') {
      return (
        row.entry.name === entryName && pathsEqual(row.parentPath, parentPath)
      );
    }

    return (
      pathsEqual(row.parentPath, parentPath) &&
      row.entryNames.includes(entryName)
    );
  });
}
