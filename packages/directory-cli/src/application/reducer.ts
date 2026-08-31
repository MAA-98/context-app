import type {
  UnixEntry,
  UnixEntryName,
  DirectoryBuffer,
  EntryPath,
  View,
} from 'directory-app';
import { updateFoldNodeAtPath, setFolds, unfoldFoldSequence, addFold } from './fold-helpers.js';
import {
  cursorForRow,
  cursorMatchesRow,
  entryAtCursor,
} from './cursor-helpers.js';
import { visibleRows } from './visible-rows.js';

export type Action =
  | {
      kind: 'expandDir'; // request to loading directory entries
      path: EntryPath;
    }
  | {
      kind: 'directoryLoaded'; // response to loading entries
      path: UnixEntryName[];
      entries: UnixEntry[];
    }
  | {
      kind: 'nextEntry';
    }
  | {
      kind: 'prevEntry';
    }
  | {
      kind: 'outDir';
    }
  | {
      kind: 'toggleFold';
    }
  | {
      kind: 'fold';
    }
  | {
      kind: 'unfold';
    }
  | {
      kind: 'exit';
      exitMessage: string;
    };

function updateEntries(
  entries: UnixEntry[],
  currentPath: UnixEntryName[],
  newEntries: UnixEntry[] | undefined,
): UnixEntry[] {
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
        throw new Error(
          `Cannot load entries for non-directory entry "${entry.name}" of kind "${entry.kind}"`,
        );
      }
      
      if (newEntries === undefined) {
        return {
          kind: 'directory' as const,
          name: entry.name,
        };
      }
      
      return {
        ...entry,
        entries: newEntries,
      };
    }
    
    if (entry.kind !== 'directory') {
      throw new Error(
        `Cannot descend through non-directory entry "${entry.name}"`,
      );
    }

    if (entry.entries === undefined) {
      throw new Error(
        `Cannot descend into unexpanded directory "${entry.name}"`,
      );
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

function updateEntriesAtPath(
  buffer: DirectoryBuffer,
  path: UnixEntryName[],
  newEntries: UnixEntry[] | undefined,
): DirectoryBuffer {
  return {
    ...buffer,
    entries: updateEntries(buffer.entries, path, newEntries),
  };
}

export function reducer(view: View, action: Action): View {
  switch (action.kind) {
    case 'nextEntry':
    case 'prevEntry': {
      const cursor = view.cursor;

      const rows = visibleRows(view.buffer, view.folds);

      const currentIndex = rows.findIndex((row) =>
        cursorMatchesRow(cursor, row),
      );

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
        cursor: cursorForRow(targetRow),
      };
    }

    case 'expandDir':
      // The asynchronous directory load is handled by App.
      return view;

    case 'directoryLoaded': {
      // Add new entries to path
      const buffer = updateEntriesAtPath(
        view.buffer,
        action.path,
        action.entries,
      );

      // Make all entries folded at path
      const folds = updateFoldNodeAtPath(view.folds, action.path, (node) =>
        setFolds(node, action.entries),
      );

      // Create cursor on fold or still at parent
      const entryNames = action.entries.map((entry) => entry.name);
      const cursor =
        entryNames.length === 0
          ? view.cursor
          : {
              kind: 'fold' as const,
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

    case 'outDir': {
      const cursor = view.cursor;

      if (cursor.kind === 'fold') {
        if (cursor.parentPath.length === 0) {
          return view;
        }

        return {
          ...view,
          cursor: {
            kind: 'entry',
            path: cursor.parentPath,
          },
        };
      }

      if (cursor.path.length <= 1) {
        return view;
      }

      return {
        ...view,
        cursor: {
          kind: 'entry',
          path: cursor.path.slice(0, -1),
        },
      };
    }

    case 'toggleFold':
      return view;

    case 'fold': {
      const cursor = view.cursor;

      if (cursor.kind !== 'entry') {
        return view;
      }

      const entry = entryAtCursor(view.buffer, cursor);

      if (entry === undefined) {
        return view;
      }

      const currentName = cursor.path[cursor.path.length - 1];

      if (currentName === undefined) {
        return view;
      }

      const parentPath = cursor.path.slice(0, -1);

      const folds = updateFoldNodeAtPath(view.folds, parentPath, (node) =>
        addFold(node, currentName),
      );

      const updatedView = {
        ...view,
        folds,
      };

      // The entry is no longer visible after folding it. Move the
      // cursor onto the resulting fold row.
      const foldedRow = visibleRows(updatedView.buffer, updatedView.folds).find(
        (row) =>
          row.kind === 'fold' &&
          row.parentPath.length === parentPath.length &&
          row.parentPath.every((name, index) => name === parentPath[index]) &&
          row.entryNames.includes(currentName),
      );

      return foldedRow === undefined
        ? updatedView
        : {
            ...updatedView,
            cursor: cursorForRow(foldedRow),
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

      const parentEntry =
        parentPath.length === 0
          ? undefined
          : entryAtCursor(view.buffer, {
              kind: 'entry',
              path: parentPath,
            });

      const entries =
        parentPath.length === 0
          ? view.buffer.entries
          : parentEntry?.kind === 'directory'
            ? parentEntry.entries
            : undefined;

      if (entries === undefined) {
        return view;
      }

      const folds = updateFoldNodeAtPath(view.folds, parentPath, (node) =>
        unfoldFoldSequence(node, entries, firstEntryName),
      );

      return {
        ...view,
        folds,
        cursor: {
          kind: 'entry',
          path: [...parentPath, firstEntryName],
        },
      };
    }

    case 'exit':
      // Exit is handled by App.
      return view;
  }
}