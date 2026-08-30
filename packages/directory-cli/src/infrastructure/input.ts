import type { Key } from 'ink';

import type { Action } from '../application/reducer.js';
import { entryAtCursor } from '../application/entry-at-cursor.js';
import type { State } from '../application/state.js';

export type PendingInput = 'z';

export type InputResult = Action | PendingInput | undefined;

export function inputToInputResult(
  input: string,
  key: Key,
  state: State,
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

  // not prefixed inputs
  if (input === 'l' || key.rightArrow) {
    const selectedEntry = entryAtCursor(state.view.buffer, state.view.cursor);

    if (
      selectedEntry?.kind === 'directory' &&
      selectedEntry.entries === undefined
    ) {
      return {
        kind: 'expandDir',
      };
    }
    return undefined;
  }

  if (input === 'h' || key.leftArrow) {
    if (state.view.cursor.length <= 1) {
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
      exitStatus: {
        exitMessage: '',
      },
    };
  }

  return undefined;
}
