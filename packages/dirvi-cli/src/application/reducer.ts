import { UnixEntry, State, FoldNode } from 'dirvi-lib';
import { ReducerAction } from './reducer-action.js';

export function reducer(state: State, action: ReducerAction): State {
  switch (action.kind) {
    case 'changeCursor':
      return {
        ...state,
        cursor: action.cursor,
      };

    case 'updateDir':
      return {
        ...state,
        buffer: UnixEntry.setEntriesAtPath(
          state.buffer,
          action.path,
          action.entries,
        ),
      };

    case 'fold': {
      const folds = FoldNode.addFoldedEntryAtPath(
        state.folds,
        action.parentPath,
        action.entry,
      );

      return {
        ...state,
        folds,
        cursor: action.cursor,
      };
    }

    case 'unfold': {
      const folds = FoldNode.modifyAtPath(
        state.folds,
        action.parentPath,
        (node) => FoldNode.clearFoldedEntries(node),
      );

      return {
        ...state,
        folds,
        cursor: action.cursor,
      };
    }
  }
}
