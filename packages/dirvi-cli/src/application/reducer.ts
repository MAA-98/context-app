import { PosixFoldNodeApi, PosixNodeApi, PosixState } from 'dirvi-lib';
import { ReducerAction } from './reducer-action.js';

export function reducer(state: PosixState, action: ReducerAction): PosixState {
  switch (action.kind) {
    case 'changeCursor':
      return {
        ...state,
        cursor: action.cursor,
      };

    case 'updateDir':
      const buffer = PosixNodeApi.setBranchesAtPath(
        state.buffer,
        action.path,
        action.entries,
      );

      if (buffer === undefined) {
        return state;
      }

      return {
        ...state,
        buffer,
      };

    case 'fold': {
      const foldNode = PosixFoldNodeApi.addFoldedEntryAtPath(
        state.foldNode,
        action.parentPath,
        action.entry,
      );

      return {
        ...state,
        foldNode,
        cursor: action.cursor,
      };
    }

    case 'unfold': {
      const foldNode = PosixFoldNodeApi.modifyAtPath(
        state.foldNode,
        action.parentPath,
        (node) => PosixFoldNodeApi.clearFoldedEntries(node),
      );

      return {
        ...state,
        foldNode,
        cursor: action.cursor,
      };
    }
  }
}
