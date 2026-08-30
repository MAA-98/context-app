import type { UnixEntry, UnixEntryName } from 'directory-app';

import type {
  DirectoryBuffer,
  EntryPath,
  FoldNode,
  VisibleRow,
} from '../domain/view.js';

function visibleRowsAtPath(
  entries: UnixEntry[],
  path: EntryPath,
  foldNode: FoldNode | undefined,
  indent: number,
): VisibleRow[] {
  const rows: VisibleRow[] = [];
  let index = 0;

  while (index < entries.length) {
    const entry = entries[index];

    if (foldNode !== undefined && foldNode.folds.includes(entry.name)) {
      const entryNames: UnixEntryName[] = [];

      while (
        index < entries.length &&
        foldNode.folds.includes(entries[index].name)
      ) {
        entryNames.push(entries[index].name);
        index += 1;
      }

      rows.push({
        kind: 'fold',
        parentPath: path,
        entryNames,
        indent,
      });

      continue;
    }

    const entryPath = [...path, entry.name];

    rows.push({
      kind: 'entry',
      path: entryPath,
      entry,
      indent,
    });

    if (entry.kind === 'directory' && entry.entries !== undefined) {
      rows.push(
        ...visibleRowsAtPath(
          entry.entries,
          entryPath,
          foldNode?.children[entry.name],
          indent + 1,
        ),
      );
    }

    index += 1;
  }

  return rows;
}

export function visibleRows(
  buffer: DirectoryBuffer,
  folds: FoldNode,
): VisibleRow[] {
  return visibleRowsAtPath(buffer.entries, [], folds, 0);
}
