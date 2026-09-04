import { UnixEntry, UnixEntryPath } from './unix-entry.js';
import { InputState } from './input-state.js';

// Still pure actions, but more semantic than ReducerActions.
export type Effect =
  | {
      effectType: 'dispatchEffectAction';
      action: EffectAction;
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
      effectType: 'quit';
      exitMessage: string;
    }
  | {
      effectType: 'setInputState';
      inputState: InputState;
    };

// Actions for reducer, still at effects-level though.
export type EffectAction =
  | {
      effectActionType: 'nextEntry';
    }
  | {
      effectActionType: 'prevEntry';
    }
  | {
      effectActionType: 'updateDir';
      path: UnixEntryPath;
      entries: UnixEntry[] | undefined;
    }
  | {
      effectActionType: 'outDir';
    }
  | {
      effectActionType: 'fold';
    }
  | {
      effectActionType: 'unfold';
    }
  | {
      effectActionType: 'toggleFold';
    };
