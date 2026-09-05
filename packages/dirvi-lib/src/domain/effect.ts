import { InputState } from './input-state.js';
import { PosixName, PosixNode } from './posix-node.js';

// Still pure actions, but more semantic than ReducerActions.
export type Effect =
  | {
      effectType: 'dispatchEffectAction';
      action: EffectAction;
    }
  | {
      effectType: 'loadDir';
      path: PosixName[];
    }
  | {
      effectType: 'printFile';
      path: PosixName[];
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
      path: PosixName[];
      entries: PosixNode[] | null;
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
