import type {
  DisplayRow,
  EntryPath,
  FoldNode,
  UnixEntry,
  UnixEntryName,
} from 'directory-app';

import { hasFold } from './fold-helpers.js';

export function getDisplayRows(
  entries: UnixEntry[],
  foldNode: FoldNode | undefined,
  path: EntryPath,
  indent: number,
): DisplayRow[] {
  const rows: DisplayRow[] = [];
  let entryIndex = 0;

  while (entryIndex < entries.length) {
    const entry = entries[entryIndex];

    if (foldNode !== undefined && hasFold(foldNode, entry.name)) {
      const entryNames: UnixEntryName[] = [];
      let nextIndex = entryIndex;

      while (
        nextIndex < entries.length &&
        hasFold(foldNode, entries[nextIndex].name)
      ) {
        entryNames.push(entries[nextIndex].name);
        nextIndex += 1;
      }

      rows.push({
        kind: 'fold',
        parentPath: path,
        entryNames,
        indent,
      });

      entryIndex = nextIndex;
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
        ...getDisplayRows(
          entry.entries,
          foldNode?.children[entry.name],
          entryPath,
          indent + 1,
        ),
      );
    }

    entryIndex += 1;
  }

  return rows;
}
