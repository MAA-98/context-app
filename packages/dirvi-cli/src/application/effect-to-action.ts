import { NavigationNode, State } from 'dirvi-lib';

import type { ReducerAction } from './reducer-action.js';
import { EffectAction } from './intent-to-effect.js';

export function effectToAction(
  effectAction: EffectAction,
  navigation: NavigationNode,
  state: State,
): ReducerAction | undefined {
  switch (effectAction.kind) {
    case 'nextEntry': {
      const cursor = NavigationNode.nextCursor(navigation, state.cursor);

      return cursor === undefined
        ? undefined
        : {
            kind: 'changeCursor',
            cursor,
          };
    }

    case 'prevEntry': {
      const cursor = NavigationNode.previousCursor(navigation, state.cursor);

      return cursor === undefined
        ? undefined
        : {
            kind: 'changeCursor',
            cursor,
          };
    }

    case 'updateDir':
      return {
        kind: 'updateDir',
        path: effectAction.path,
        entries: effectAction.entries,
      };

    case 'outDir': {
      const cursor = NavigationNode.parentCursor(navigation, state.cursor);

      return cursor === undefined
        ? undefined
        : {
            kind: 'changeCursor',
            cursor,
          };
    }

    case 'fold': {
      if (state.cursor.kind === 'fold') {
        return undefined;
      }

      const path = [...state.cursor.parentPath, state.cursor.entryName];

      const entry = NavigationNode.getEntryAtPath(navigation, path);

      if (entry === undefined) {
        return undefined;
      }

      const cursor = NavigationNode.cursorAfterFold(navigation, state.cursor);
      if (cursor === undefined) {
        return undefined;
      }

      return {
        kind: 'fold',
        parentPath: state.cursor.parentPath,
        entry,
        cursor,
      };
    }

    case 'unfold': {
      if (state.cursor.kind !== 'fold') {
        return undefined;
      }

      const node = NavigationNode.getNodeAtPath(
        navigation,
        state.cursor.parentPath,
      );

      if (node === undefined || node.foldedEntries.length === 0) {
        return undefined;
      }

      const firstFoldedEntry = node.foldedEntries[0];

      return {
        kind: 'unfold',
        parentPath: state.cursor.parentPath,
        cursor: {
          kind: 'entry',
          parentPath: state.cursor.parentPath,
          entryName: firstFoldedEntry.name,
        },
      };
    }

    case 'toggleFold':
      return effectToAction(
        state.cursor.kind === 'fold' ? { kind: 'unfold' } : { kind: 'fold' },
        navigation,
        state,
      );
  }
}
