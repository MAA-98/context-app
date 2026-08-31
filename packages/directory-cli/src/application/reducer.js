import { rowsEqual, entryNamesEqual, } from 'directory-app';
import { updateFoldNodeAtPath, setFolds, unfoldFoldSequence, addFold } from './fold-helpers.js';
import { createDisplayRows, displayRowAtPath } from './display-rows.js';
import { entryAtPath } from './path-helpers.js';
function updateEntries(entries, currentPath, newEntries) {
    const [currentName, ...remainingPath] = currentPath;
    if (currentName === undefined) {
        throw new Error('Cannot update directory entries with an empty path');
    }
    let found = false;
    const updatedEntries = entries.map((entry) => {
        if (entry.name !== currentName) {
            return entry;
        }
        found = true;
        if (remainingPath.length === 0) {
            if (entry.kind !== 'directory') {
                throw new Error(`Cannot load entries for non-directory entry "${entry.name}" of kind "${entry.kind}"`);
            }
            if (newEntries === undefined) {
                return {
                    kind: 'directory',
                    name: entry.name,
                };
            }
            return {
                ...entry,
                entries: newEntries,
            };
        }
        if (entry.kind !== 'directory') {
            throw new Error(`Cannot descend through non-directory entry "${entry.name}"`);
        }
        if (entry.entries === undefined) {
            throw new Error(`Cannot descend into unexpanded directory "${entry.name}"`);
        }
        return {
            ...entry,
            entries: updateEntries(entry.entries, remainingPath, newEntries),
        };
    });
    if (!found) {
        throw new Error(`Directory path does not contain entry "${currentName}"`);
    }
    return updatedEntries;
}
function updateEntriesAtPath(buffer, path, newEntries) {
    return {
        ...buffer,
        entries: updateEntries(buffer.entries, path, newEntries),
    };
}
export function reducer(view, action) {
    switch (action.kind) {
        case 'nextEntry':
        case 'prevEntry': {
            const cursor = view.cursor;
            const rows = createDisplayRows(view.buffer, view.folds);
            const currentIndex = rows.findIndex((row) => rowsEqual(cursor, row));
            if (currentIndex === -1) {
                return view;
            }
            const direction = action.kind === 'nextEntry' ? 1 : -1;
            const targetIndex = currentIndex + direction;
            if (targetIndex < 0 || targetIndex >= rows.length) {
                return view;
            }
            const targetRow = rows[targetIndex];
            return {
                ...view,
                cursor: targetRow,
            };
        }
        case 'expandDir':
            // The asynchronous directory load is handled by App.
            return view;
        case 'directoryLoaded': {
            // Add new entries to path
            const buffer = updateEntriesAtPath(view.buffer, action.path, action.entries);
            // Make all entries folded at path
            const folds = updateFoldNodeAtPath(view.folds, action.path, (node) => setFolds(node, action.entries));
            // Create cursor on fold or still at parent
            const entryNames = action.entries.map((entry) => entry.name);
            const cursor = entryNames.length === 0
                ? view.cursor
                : {
                    kind: 'fold',
                    parentPath: action.path,
                    entryNames,
                };
            return {
                buffer,
                folds,
                cursor,
            };
        }
        // case 'collapseDir': {
        //   const cursor = state.view.cursor;
        //
        //   if (cursor.length <= 1) {
        //     return state;
        //   }
        //
        //   const retreatedCursor = cursor.slice(0, -1);
        //
        //   return {
        //     ...state,
        //     view: {
        //       ...state.view,
        //       buffer: updateEntriesAtPath(
        //         state.view.buffer,
        //         retreatedCursor,
        //         undefined,
        //       ),
        //       cursor: retreatedCursor,
        //     },
        //   };
        // }
        // 1. Identify the directory represented by parentPath
        // 2. Check whether the cursor fold contains all its entries
        // 3. Unload the directory entries
        // 4. Recalculate the parent display row
        // 5. Move the cursor to that parent row
        case 'outDir': {
            const cursor = view.cursor;
            const parentPath = cursor.parentPath;
            if (parentPath.length === 0) {
                return view;
            }
            const parentEntry = entryAtPath(view.buffer, parentPath);
            const shouldUnloadDirectory = cursor.kind === 'fold' &&
                parentEntry?.kind === 'directory' &&
                parentEntry.entries !== undefined &&
                entryNamesEqual(cursor.entryNames, parentEntry.entries.map((entry) => entry.name));
            const buffer = shouldUnloadDirectory
                ? updateEntriesAtPath(view.buffer, parentPath, undefined)
                : view.buffer;
            const updatedView = {
                ...view,
                buffer,
            };
            const parentDisplayRow = displayRowAtPath(updatedView.buffer, updatedView.folds, parentPath);
            if (parentDisplayRow === undefined || parentDisplayRow.kind !== 'entry') {
                return view;
            }
            return {
                ...updatedView,
                cursor: parentDisplayRow,
            };
        }
        case 'toggleFold':
            return reducer(view, view.cursor.kind === 'fold' ? { kind: 'unfold' } : { kind: 'fold' });
        case 'fold': {
            const cursor = view.cursor;
            if (cursor.kind !== 'entry') {
                return view;
            }
            const currentName = cursor.entry.name;
            const parentPath = cursor.parentPath;
            const entry = entryAtPath(view.buffer, [...parentPath, currentName]);
            if (entry === undefined) {
                return view;
            }
            const folds = updateFoldNodeAtPath(view.folds, parentPath, (node) => addFold(node, currentName));
            const updatedView = {
                ...view,
                folds,
            };
            const foldedRow = displayRowAtPath(updatedView.buffer, updatedView.folds, [...parentPath, currentName]);
            return foldedRow === undefined
                ? updatedView
                : {
                    ...updatedView,
                    cursor: foldedRow,
                };
        }
        case 'unfold': {
            const cursor = view.cursor;
            if (cursor.kind !== 'fold') {
                return view;
            }
            const firstEntryName = cursor.entryNames[0];
            if (firstEntryName === undefined) {
                return view;
            }
            const { parentPath } = cursor;
            const parentEntry = parentPath.length === 0
                ? undefined
                : entryAtPath(view.buffer, parentPath);
            const entries = parentPath.length === 0
                ? view.buffer.entries
                : parentEntry?.kind === 'directory'
                    ? parentEntry.entries
                    : undefined;
            if (entries === undefined) {
                return view;
            }
            const folds = updateFoldNodeAtPath(view.folds, parentPath, (node) => unfoldFoldSequence(node, entries, firstEntryName));
            const updatedView = {
                ...view,
                folds,
            };
            const unfoldedRow = displayRowAtPath(updatedView.buffer, updatedView.folds, [...parentPath, firstEntryName]);
            return unfoldedRow === undefined
                ? updatedView
                : {
                    ...updatedView,
                    cursor: unfoldedRow,
                };
        }
        case 'exit':
            // Exit is handled by App.
            return view;
    }
}
