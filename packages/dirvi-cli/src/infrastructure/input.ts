import type { Key } from 'ink';

import { Cursor, State, View } from 'dirvi-lib';
import { Action } from '../application/action.js';

export type PendingInput = 'z';
export type InputResult = Action | PendingInput | undefined;

export function userInputToInputResult(
  input: string,
  key: Key,
  view: State,
  pendingInput?: PendingInput,
): InputResult {
  // Adding Pending Input
  if (pendingInput === undefined && input === 'z') {
    return 'z';
  }

  // z prefixed inputs
  if (pendingInput === 'z') {
    if (input === 'a') {
      return {
        kind: 'toggleFold',
      };
    }

    if (input === 'c') {
      return {
        kind: 'fold',
      };
    }

    if (input === 'o') {
      return {
        kind: 'unfold',
      };
    }

    // Unknown z command.
    return undefined;
  }

  // Not prefixed inputs
  if (input === 'l' || key.rightArrow) {
    const currentEntry = View.getEntryAtCursor(view)
    if (currentEntry === undefined) {
      return undefined;
    }

    if (currentEntry.kind === 'directory') {
      const path = Cursor.getPath(view.cursor)
      if (path === undefined) {
        return undefined
      }
      
      return {
        kind: 'updateDir',
        path,
        entries: currentEntry.entries,
      };
    }

    if (currentEntry.kind === 'file') {
      const path = Cursor.getPath(view.cursor)
      if (path === undefined) {
        return undefined
      }
      return {
        kind: 'printFile',
        path,
      };
    }

    return undefined;
  }

  if (input === 'h' || key.leftArrow) {
    if (view.cursor.parentPath.length === 0) {
      return undefined;
    }

    return {
      kind: 'outDir',
    };
  }

  if (input === 'k' || key.upArrow) {
    return {
      kind: 'prevEntry',
    };
  }

  if (input === 'j' || key.downArrow) {
    return {
      kind: 'nextEntry',
    };
  }

  if (input === 'q' || key.escape) {
    return {
      kind: 'exit',
      exitMessage: '',
    };
  }

  return undefined;
}
