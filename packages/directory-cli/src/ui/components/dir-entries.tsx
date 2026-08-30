import { Box } from 'ink';

import { UnixEntry, UnixEntryName } from 'directory-app';

import { UnixEntry as UnixEntryComponent } from './unix-entry.js';

// Display column of entries in directory, indented, and with optional
// cursor in a position.
function DirEntries({
  entries,
  indent,
  cursor,
}: {
  entries: UnixEntry[];
  indent: number;
  cursor?: UnixEntryName[];
}) {
  return (
    <>
      {entries.map((entry) => {
        const selected = cursor?.length === 1 && cursor[0] === entry.name;
        const childCursor =
          cursor?.[0] === entry.name ? cursor.slice(1) : undefined;

        return (
          <Box key={`${entry.name}`} flexDirection="column">
            <Box paddingLeft={indent * 2}>
              <UnixEntryComponent entry={entry} selected={selected} />
            </Box>

            {entry.kind === 'directory' && entry.entries !== undefined && (
              <DirEntries
                entries={entry.entries}
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