import { pathsEqual, } from 'directory-app';
import { hasFold } from './fold-helpers.js';
function displayRowsAtPath(entries, path, foldNode) {
    const rows = [];
    let index = 0;
    while (index < entries.length) {
        const entry = entries[index];
        if (foldNode !== undefined && hasFold(foldNode, entry.name)) {
            const entryNames = [];
            while (index < entries.length && hasFold(foldNode, entries[index].name)) {
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
            rows.push(...displayRowsAtPath(entry.entries, [...path, entry.name], foldNode?.children[entry.name]));
        }
        index += 1;
    }
    return rows;
}
export function createDisplayRows(buffer, folds) {
    return displayRowsAtPath(buffer.entries, [], folds);
}
export function displayRowAtPath(buffer, folds, path) {
    if (path.length === 0) {
        return undefined;
    }
    const rows = createDisplayRows(buffer, folds);
    const parentPath = path.slice(0, -1);
    const entryName = path[path.length - 1];
    return rows.find((row) => {
        if (row.kind === 'entry') {
            return (row.entry.name === entryName && pathsEqual(row.parentPath, parentPath));
        }
        return (pathsEqual(row.parentPath, parentPath) &&
            row.entryNames.includes(entryName));
    });
}
