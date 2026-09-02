import {
  UnixEntry,
  View,
  FoldNode,
  Cursor,
} from 'dirvi-lib';
import { createDisplayRows, displayRowAtPath } from './display-rows.js';
import { Action } from './action.js';

export function reducer(view: View, action: Action): View {
  switch (action.kind) {
    case 'nextEntry':
    case 'prevEntry': {
      const displayRows = createDisplayRows(view.buffer, view.folds);
      const currentIndex = displayRows.findIndex((row) =>
        Cursor.matchesDisplayRow(view.cursor, row),
      );

      if (currentIndex === -1) {
        return view;
      }

      const direction = action.kind === 'nextEntry' ? 1 : -1;
      const targetIndex = currentIndex + direction;

      if (targetIndex < 0 || targetIndex >= displayRows.length) {
        return view;
      }

      return {
        ...view,
        cursor: Cursor.fromDisplayRow(displayRows[targetIndex]),
      };
    }

    case 'updateDir':
      return {
        ...view,
        buffer: {
          ...view.buffer,
          entries: UnixEntry.setEntriesAtPath(
            view.buffer.entries,
            action.path,
            action.entries,
          ),
        },
      };

    case 'printFile':
      // Handled by App
      return view;

    case 'outDir': {
      const { parentPath } = view.cursor;

      if (parentPath.length === 0) {
        return view;
      }

      const parentDisplayRow = displayRowAtPath(
        view.buffer,
        view.folds,
        parentPath,
      );

      if (parentDisplayRow === undefined || parentDisplayRow.kind !== 'entry') {
        return view;
      }

      return {
        ...view,
        cursor: Cursor.fromDisplayRow(parentDisplayRow),
      };
    }

    case 'toggleFold':
      return reducer(
        view,
        view.cursor.kind === 'fold' ? { kind: 'unfold' } : { kind: 'fold' },
      );

    case 'fold': {
      const cursor = view.cursor;
      if (cursor.kind === 'fold') {
        return view;
      }

      const entriesAmongCursor = UnixEntry.getEntriesAtPath(
        view.buffer.entries,
        cursor.parentPath,
      );
      if (entriesAmongCursor === undefined) {
        return view;
      }

      const currentIndex = entriesAmongCursor.findIndex(
        (entry) => entry.name === cursor.entryName,
      );
      if (currentIndex === -1) {
        return view;
      }

      const currentEntry = entriesAmongCursor[currentIndex];

      const newFoldRoot = FoldNode.addFoldedEntryAtPath(
        view.folds,
        cursor.parentPath,
        currentEntry,
      );

      return view;
      // const foldedEntryNamesAmongCursor = newFoldRoot.folds
      // const unfoldedEntryNamesAmongCursor = entriesAmongCursor.filter(...)
      // const newCursorRow = DisplayEntry.fromUnixEntry(
      //   unfoldedEntryNamesAmongCursor.at ...
      // )
      // const newCursor =
    }

    case 'unfold': {
      // const cursor = view.cursor;
      //
      // if (cursor.kind !== 'fold') {
      //   return view;
      // }
      //
      // const { parentPath } = cursor;
      // const foldNode = FoldNode.atPath(view.folds, parentPath);
      //
      // if (foldNode === undefined || foldNode.folds.length === 0) {
      //   return view;
      // }
      //
      // const foldedEntryNames = foldNode.folds;
      // const entries = DirectoryBuffer.entriesAtPath(view.buffer, parentPath);
      //
      // const newFoldRoot = FoldNode.modifyAtPath(
      //   view.folds,
      //   parentPath,
      //   (node) => FoldNode.clearFoldedEntries(node),
      // );
      //
      // if (entries === undefined) {
      //   return {
      //     ...view,
      //     folds: newFoldRoot,
      //   };
      // }
      //
      // const firstUnfoldedEntry = entries.find((entry) =>
      //   foldedEntryNames.includes(entry.name),
      // );
      //
      // if (firstUnfoldedEntry === undefined) {
      //   return {
      //     ...view,
      //     folds: newFoldRoot,
      //   };
      // }
      //
      // return {
      //   ...view,
      //   folds: newFoldRoot,
      //   cursor: {
      //     kind: 'entry',
      //     parentPath,
      //     entry: DisplayEntry.fromUnixEntry(firstUnfoldedEntry),
      //   },
      // };
    }

    case 'exit':
      // Exit is handled by App.
      return view;
  }
}
