import type { Key } from 'ink';
import type { Action, State } from '../application/reducer.js';
import { entryAtCursor } from '../application/entry-at-cursor.js';

export function inputToAction(
  input: string,
  key: Key,
  state: State,
): Action | undefined {
  if (input === 'q' || key.escape) {
    return {
      kind: 'exit',
      exitStatus: {
        exitMessage: '',
      },
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
    return undefined
  }

  return undefined;
}
