import { Box, Text } from 'ink';

import type { Cursor, DisplayRow } from 'directory-app';

import { UnixEntry as UnixEntryComponent } from './UnixEntry.js';
import { namesEqual, pathsEqual } from '../../application/path-helpers.js';

// Display column of entries in directory, indented, and optional
// cursor in position.
function DirEntries({ rows, cursor }: { rows: DisplayRow[]; cursor: Cursor }) {
  return (
    <>
      {rows.map((row) => {
        if (row.kind === 'fold') {
          const selected =
            cursor.kind === 'fold' &&
            pathsEqual(cursor.parentPath, row.parentPath) &&
            namesEqual(cursor.entryNames, row.entryNames);

          return (
            <Box
              key={`fold-${row.parentPath.join('/')}-${row.entryNames[0]}`}
              paddingLeft={row.indent * 2}
            >
              <Text inverse={selected} dimColor={!selected}>
                ...
              </Text>
            </Box>
          );
        }

        const selected =
          cursor.kind === 'entry' && pathsEqual(cursor.path, row.path);

        return (
          <Box key={row.path.join('/')} paddingLeft={row.indent * 2}>
            <UnixEntryComponent entry={row.entry} selected={selected} />
          </Box>
        );
      })}
    </>
  );
}

export default DirEntries;