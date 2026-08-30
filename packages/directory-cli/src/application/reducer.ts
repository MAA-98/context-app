import type { UnixDirectory, UnixEntryName } from 'directory-app';

export type View = {
  cursor: UnixEntryName[];
};

export type ExitStatus = {
  exitMessage: string;
};

export type State = {
  buffer: UnixDirectory;
  view: View;
  exitStatus?: ExitStatus;
};

export type Action =
  | {
      kind: 'expandDir';
    }
  | {
      kind: 'nextEntry';
    }
  | {
      kind: 'prevEntry';
    }
  | {
      kind: 'exit';
      exitStatus: ExitStatus;
    };

export function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'expandDir':
      // Directory expansion will be implemented here.
      return state;

    // TODO: Malformed cases result in trying to fix state
    case 'nextEntry':
    case 'prevEntry': {
      const entries = state.buffer.entries;

      if (entries.length === 0) {
        return state;
      }

      const cursor = state.view.cursor;
      const currentName = cursor[cursor.length - 1];

      // If cursor is empty then currentName undefined
      if (currentName === undefined) {
        return state;
      }

      const currentIndex = entries.findIndex(
        (entry) => entry.name === currentName,
      );

      if (currentIndex === -1) {
        return state; // TODO: Fix stale or malformed cursor
      }
      
      const direction = action.kind === 'nextEntry' ? 1 : -1;
      const targetIndex = currentIndex + direction;
      
      if (targetIndex < 0 || targetIndex >= entries.length) {
        return state;
      }
      
      const targetEntry = entries[targetIndex];

      return {
        ...state,
        view: {
          ...state.view,
          cursor: [...cursor.slice(0, -1), targetEntry.name],
        },
      };
    }

    case 'exit':
      return {
        ...state,
        exitStatus: action.exitStatus,
      };
  }
}