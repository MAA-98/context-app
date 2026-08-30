import { Box, Text } from 'ink';

import { UnixEntry, UnixEntryName } from 'directory-app';

import { UnixEntry as UnixEntryComponent } from './unix-entry.js';
import { FoldNode } from '../../application/state.js';
import { hasFold } from '../../application/folds.js';

// Display column of entries in directory, indented, and with optional
// cursor in a position.
function DirEntries({
  entries,
  foldNode,
  indent,
  cursor,
}: {
  entries: UnixEntry[];
  foldNode?: FoldNode,
  indent: number;
  cursor?: UnixEntryName[];
}) {
  let previousEntryWasFolded = false;
  
  return (
    <>
      {entries.map((entry) => {
        const entryIsFolded = foldNode !== undefined && hasFold(foldNode, entry.name);
        
        if (entryIsFolded) {
          if (previousEntryWasFolded) {
            return null;
          }

          previousEntryWasFolded = true;

          return (
            <Box key={`fold-${entry.name}`} paddingLeft={indent * 2}>
              <Text dimColor>...</Text>
            </Box>
          );
        }
        
        previousEntryWasFolded = false;
        
        const selected = cursor?.length === 1 && cursor[0] === entry.name;
        const childCursor =
          cursor?.[0] === entry.name ? cursor.slice(1) : undefined;
        const childFoldNode = foldNode?.children[entry.name];

        return (
          <Box key={`${entry.name}`} flexDirection="column">
            <Box paddingLeft={indent * 2}>
              <UnixEntryComponent entry={entry} selected={selected} />
            </Box>

            {entry.kind === 'directory' &&
              entry.entries !== undefined && (
                <DirEntries
                  entries={entry.entries}
                  foldNode={childFoldNode}
                  cursor={childCursor}
                  indent={indent + 1}
                />
              )}
          </Box>
        );
      })}
    </>
  );
}

export default DirEntries;