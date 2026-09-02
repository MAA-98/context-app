import {
  DirectoryBuffer,
  DisplayRow,
  UnixEntryPath, FoldNode,
  UnixEntry,
  UnixEntryName,
} from 'dirvi-lib';

function displayRowsAtPath(
  entries: UnixEntry[],
  path: UnixEntryPath,
  foldNode: FoldNode | undefined,
): DisplayRow[] {
  const rows: DisplayRow[] = [];
  let index = 0;

  while (index < entries.length) {
    const entry = entries[index];

    if (foldNode !== undefined && FoldNode.getIfEntryFolded(foldNode, entry)) {
      const entryNames: UnixEntryName[] = [];

      while (
        index < entries.length &&
        FoldNode.getIfEntryFolded(foldNode, entries[index])
      ) {
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
  path: UnixEntryPath,
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
        row.entry.name === entryName && UnixEntryPath.equal(row.parentPath, parentPath)
      );
    }

    return (
      UnixEntryPath.equal(row.parentPath, parentPath) &&
      row.entryNames.includes(entryName)
    );
  });
}
