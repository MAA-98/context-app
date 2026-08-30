import type { Key } from 'ink';
import type { Action } from '../application/reducer.js';

export function inputToAction(
  input: string,
  key: Key,
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

  return undefined;
}
