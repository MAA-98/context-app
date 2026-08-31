import { Box, Text } from 'ink';

import type { Cursor, DisplayRow } from 'directory-app';
import { rowsEqual } from 'directory-app';

import { UnixEntry as UnixEntryComponent } from './UnixEntry.js';

// Display column of entries in directory, indented, and optional
// cursor in position.
function DirEntries({ rows, cursor }: { rows: DisplayRow[]; cursor: Cursor }) {
  return (
    <>
      {rows.map((row) => {
        const selected = rowsEqual(cursor, row);
        const indent = row.parentPath.length;
        
        if (row.kind === 'fold') {
          return (
            <Box
              key={`fold-${row.parentPath.join('/')}-${row.entryNames[0]}`}
              paddingLeft={indent * 2}
            >
              <Text inverse={selected} dimColor={!selected}>
                ...
              </Text>
            </Box>
          );
        }

        return (
          <Box
            key={[...row.parentPath, row.entry.name].join('/')}
            paddingLeft={indent * 2}
          >
            <UnixEntryComponent entry={row.entry} selected={selected} />
          </Box>
        );
      })}
    </>
  );
}

export default DirEntries;