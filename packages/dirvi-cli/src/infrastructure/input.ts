import type { Key } from 'ink';

import type { View } from 'dirvi-lib';

import type { Action } from '../application/reducer.js';

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
    // To do: `L` does recursive opening directories
    if (view.cursor.kind !== 'entry') {
      return undefined;
    }
    
    const path = [...view.cursor.parentPath, view.cursor.entry.name];
    
    if (view.cursor.entry.kind === 'directory') {
      return {
        kind: 'toggleDir',
        path,
      };
    }

    if (view.cursor.entry.kind === 'file') {
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
