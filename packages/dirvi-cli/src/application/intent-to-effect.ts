import { Cursor, State, UnixEntryPath, View } from 'dirvi-lib';
import { Action } from './action.js';
import { Intent } from './user-input-to-intent.js';

export type Effect =
  | {
      effectType: 'dispatch';
      action: Action;
    }
  | {
      effectType: 'loadDir';
      path: UnixEntryPath;
    }
  | {
      effectType: 'printFile';
      path: UnixEntryPath;
    }
  | {
      effectType: 'exit';
      exitMessage: string;
    };

export type EffectResult = {
  commandBuffer: string;
  effect?: Effect;
};

function dispatchAction(action: Action): Effect {
  return {
    effectType: 'dispatch',
    action,
  };
}

function interactRightToEffect(state: State): Effect | undefined {
  const currentEntry = View.getEntryAtCursor(state);

  if (currentEntry === undefined) {
    return undefined;
  }

  const path = Cursor.getPath(state.cursor);

  if (path === undefined) {
    return undefined;
  }

  if (currentEntry.kind === 'directory') {
    if (currentEntry.entries === undefined) {
      return {
        effectType: 'loadDir',
        path,
      };
    } else {
      return dispatchAction({
        kind: 'updateDir',
        path,
        entries: undefined,
      });
    }
  }

  if (currentEntry.kind === 'file') {
    return {
      effectType: 'printFile',
      path,
    };
  }

  // TODO Later: Peeking on folds

  return undefined;
}

function interactLeftToEffect(state: State): Effect | undefined {
  if (state.cursor.parentPath.length === 0) {
    return undefined;
  }

  return dispatchAction({
    kind: 'outDir',
  });
}

// Here if the updated command buffer reaches a recognized motion,
// sends the effect.
function commandBufferToEffectResult(
  updatedCommandBuffer: string,
): EffectResult {
  switch (updatedCommandBuffer) {
    case 'q':
      return {
        commandBuffer: '',
        effect: {
          effectType: 'exit',
          exitMessage: '',
        },
      };

    case 'za':
      return {
        commandBuffer: '',
        effect: dispatchAction({
          kind: 'toggleFold',
        }),
      };

    case 'zc':
      return {
        commandBuffer: '',
        effect: dispatchAction({
          kind: 'fold',
        }),
      };

    case 'zo':
      return {
        commandBuffer: '',
        effect: dispatchAction({
          kind: 'unfold',
        }),
      };

    default:
      return {
        commandBuffer: updatedCommandBuffer,
      };
  }
}

// Effect derived from Intent and the state.
export function intentToEffect(
  intent: Intent,
  state: State,
): EffectResult | undefined {
  switch (intent.intentType) {
    case 'updateCommandBuffer':
      return commandBufferToEffectResult(intent.updatedCommandBuffer);

    case 'interactRight':
      return {
        commandBuffer: '',
        effect: interactRightToEffect(state),
      };

    case 'interactLeft':
      return {
        commandBuffer: '',
        effect: interactLeftToEffect(state),
      };

    case 'interactDown':
      return {
        commandBuffer: '',
        effect: dispatchAction({
          kind: 'nextEntry',
        }),
      };

    case 'interactUp':
      return {
        commandBuffer: '',
        effect: dispatchAction({
          kind: 'prevEntry',
        }),
      };
  }
}