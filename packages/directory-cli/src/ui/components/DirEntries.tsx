import { Box, Text } from 'ink';

import type { Cursor, EntryPath, FoldNode, UnixEntry, UnixEntryName } from 'directory-app';

import { UnixEntry as UnixEntryComponent } from './UnixEntry.js';
import { hasFold } from '../../application/fold-helpers.js';
import { namesEqual, pathsEqual } from '../../application/path-helpers.js';

// Display column of entries in directory, indented, and with optional
// cursor in a position.
function DirEntries({
  entries,
  foldNode,
  indent,
  path,
  cursor,
}: {
  entries: UnixEntry[];
  foldNode?: FoldNode;
  indent: number;
  path: EntryPath;
  cursor?: Cursor;
}) {
  let previousEntryWasFolded = false;

  return (
    <>
      {entries.map((entry, entryIndex) => {
        const entryIsFolded =
          foldNode !== undefined && hasFold(foldNode, entry.name);

        if (entryIsFolded) {
          if (previousEntryWasFolded) {
            return null;
          }

          const foldedEntryNames: UnixEntryName[] = [];
          let nextIndex = entryIndex;

          while (
            nextIndex < entries.length &&
            foldNode !== undefined &&
            hasFold(foldNode, entries[nextIndex].name)
          ) {
            foldedEntryNames.push(entries[nextIndex].name);
            nextIndex += 1;
          }

          previousEntryWasFolded = true;

          const selected =
            cursor?.kind === 'fold' &&
            pathsEqual(cursor.parentPath, path) &&
            namesEqual(cursor.entryNames, foldedEntryNames);

          return (
            <Box key={`fold-${entry.name}`} paddingLeft={indent * 2}>
              <Text inverse={true} dimColor={!selected}>
                ...
              </Text>
            </Box>
          );
        }

        previousEntryWasFolded = false;

        const selected =
          cursor?.kind === 'entry' &&
          cursor.path.length === 1 &&
          cursor.path[0] === entry.name;

        const childCursor =
          cursor?.kind === 'entry' && cursor.path[0] === entry.name
            ? {
                kind: 'entry' as const,
                path: cursor.path.slice(1),
              }
            : undefined;

        const childFoldNode = foldNode?.children[entry.name];

        return (
          <Box key={entry.name} flexDirection="column">
            <Box paddingLeft={indent * 2}>
              <UnixEntryComponent entry={entry} selected={selected} />
            </Box>

            {entry.kind === 'directory' && entry.entries !== undefined && (
              <DirEntries
                entries={entry.entries}
                foldNode={childFoldNode}
                cursor={childCursor}
                indent={indent + 1}
                path={[...path, entry.name]}
              />
            )}
          </Box>
        );
      })}
    </>
  );
}

export default DirEntries;