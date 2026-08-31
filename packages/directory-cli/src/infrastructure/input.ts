import type { Key } from 'ink';

import type { Action } from '../application/reducer.js';
import { entryAtCursor } from '../application/cursor-helpers.js';
import type { View } from 'directory-app';
import { pathInCursor } from '../application/cursor-helpers.js';

export type PendingInput = 'z';

export type InputResult = Action | PendingInput | undefined;

export function inputToInputResult(
  input: string,
  key: Key,
  view: View,
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
    const selectedEntry = entryAtCursor(view.buffer, view.cursor);

    if (
      view.cursor.kind === 'entry' &&
      selectedEntry?.kind === 'directory' &&
      selectedEntry.entries === undefined
    ) {
      return {
        kind: 'expandDir',
        path: view.cursor.path,
      };
    }
    return undefined;
  }

  if (input === 'h' || key.leftArrow) {
    if (pathInCursor(view.cursor).length <= 1) {
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
