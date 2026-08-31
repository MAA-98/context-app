import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { rowsEqual } from 'directory-app';
import { UnixEntry as UnixEntryComponent } from './UnixEntry.js';
// Display column of entries in directory, indented, and optional
// cursor in position.
function DirEntries({ rows, cursor }) {
    return (_jsx(_Fragment, { children: rows.map((row) => {
            const selected = rowsEqual(cursor, row);
            const indent = row.parentPath.length;
            if (row.kind === 'fold') {
                return (_jsx(Box, { paddingLeft: indent * 2, children: _jsx(Text, { inverse: selected, dimColor: !selected, children: "..." }) }, `fold-${row.parentPath.join('/')}-${row.entryNames[0]}`));
            }
            return (_jsx(Box, { paddingLeft: indent * 2, children: _jsx(UnixEntryComponent, { entry: row.entry, selected: selected }) }, [...row.parentPath, row.entry.name].join('/')));
        }) }));
}
export default DirEntries;
