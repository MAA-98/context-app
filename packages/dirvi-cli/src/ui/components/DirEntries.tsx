import { Box, Text, useWindowSize } from 'ink';

import type { Cursor, DisplayRow } from 'dirvi-lib';
import { rowsEqual } from 'dirvi-lib';

import { UnixEntry as UnixEntryComponent } from './UnixEntry.js';
import { useRef } from 'react';

// Display column of entries in directory, indented, and optional
// cursor in position.
function DirEntries({ rows, cursor }: { rows: DisplayRow[]; cursor: Cursor }) {
  const scrollMargin = 3;
  const { rows: terminalRows } = useWindowSize();
  const viewportStartRef = useRef(0);
  
  const cursorIndex = rows.findIndex((row) =>
    rowsEqual(cursor, row),
  );
  const viewportHeight = Math.max(1, terminalRows);
  const maximumViewportStart = Math.max(0, rows.length - viewportHeight);
  
  let viewportStart = viewportStartRef.current;
  if (cursorIndex >= 0) {
    const firstVisibleCursorIndex = viewportStart + scrollMargin;
    const lastVisibleCursorIndex = viewportStart + viewportHeight - 1 - scrollMargin;

    if (cursorIndex < firstVisibleCursorIndex) {
      // Cursor moved above the visible area.
      viewportStart = cursorIndex - scrollMargin;
    } else if (cursorIndex > lastVisibleCursorIndex) {
      // Cursor moved below the visible area.
      viewportStart = cursorIndex - viewportHeight + 1 + scrollMargin;
    }
  }
  viewportStart = Math.max(0, Math.min(viewportStart, maximumViewportStart));
  viewportStartRef.current = viewportStart;
  
  const visibleRows = rows.slice(
    viewportStart,
    viewportStart + viewportHeight,
  );
  
  return (
    <>
      {visibleRows.map((row) => {
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