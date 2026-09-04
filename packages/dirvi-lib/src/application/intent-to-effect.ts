import { Effect, EffectAction } from '../domain/effect.js';
import { State, View } from '../domain/state.js';
import { Cursor } from '../domain/cursor.js';
import { Intent } from '../domain/intent.js';

function dispatchAction(action: EffectAction): Effect {
  return {
    effectType: 'dispatchEffectAction',
    action,
  };
}

// Effect derived from intent and the state.
export function intentToEffect(
  intent: Intent,
  state: State,
): Effect | undefined {
  switch (intent.intentType) {
    case 'setNormalBuffer':
      return normalBufferToEffectResult(intent.normalBuffer);

    case 'normalRight':
      return normalInteractRightToEffect(state);

    case 'normalLeft':
      return normalInteractLeftToEffect(state);

    case 'normalDown':
      return dispatchAction({
        effectActionType: 'nextEntry',
      });

    case 'normalUp':
      return dispatchAction({
        effectActionType: 'prevEntry',
      });

    case 'enterCommandLineMode':
      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'command',
          commandLine: ':',
        },
      };

    case 'setCommandLine':
      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'command',
          commandLine: intent.commandLine,
        },
      };

    case 'exitCommandLineMode':
      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'normal',
          normalBuffer: '',
        },
      };

    case 'executeCommandLine':
      if (intent.commandLine === ':q') {
        return {
          effectType: 'quit',
          exitMessage: '',
        };
      }

      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'normal',
          normalBuffer: '',
        },
      };
  }
}

// Sets the buffer. Three possibilities:
// - New command buffer is recognized as a motion, this dispatches the
// "effect action". Consumer will know to reset the input state.
// - Prefix of a possible motion, updates normal buffer.
// - Not a prefix, clears the buffer.
function normalBufferToEffectResult(
  updatedNormalBuffer: string,
): Effect | undefined {
  switch (updatedNormalBuffer) {
    case 'z':
      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'normal',
          normalBuffer: updatedNormalBuffer,
        },
      };

    case 'za':
      return dispatchAction({
        effectActionType: 'toggleFold',
      });

    case 'zc':
      return dispatchAction({
        effectActionType: 'fold',
      });

    case 'zo':
      return dispatchAction({
        effectActionType: 'unfold',
      });

    default:
      return {
        effectType: 'setInputState',
        inputState: {
          inputMode: 'normal',
          normalBuffer: '',
        },
      };
  }
}

function normalInteractRightToEffect(state: State): Effect | undefined {
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
        effectActionType: 'updateDir',
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

function normalInteractLeftToEffect(state: State): Effect | undefined {
  if (state.cursor.parentPath.length === 0) {
    return undefined;
  }

  return dispatchAction({
    effectActionType: 'outDir',
  });
}
