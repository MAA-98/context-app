import type { UnixDirectory, UnixEntry, UnixEntryName } from 'directory-app';

export type View = {
  buffer: UnixDirectory;
  cursor: UnixEntryName[];
};

export type ExitStatus = {
  exitMessage: string;
};

export type State = {
  view: View;
  exitStatus?: ExitStatus;
};

export type Action =
  | {
      kind: 'expandDir';
    }
  | {
      kind: 'directoryLoaded';
      path: UnixEntryName[];
      entries: UnixEntry[];
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

function setDirectoryEntries(
  entries: UnixEntry[],
  path: UnixEntryName[],
  childEntries: UnixEntry[],
): UnixEntry[] {
  const [currentName, ...remainingPath] = path;

  if (currentName === undefined) {
    return entries;
  }

  return entries.map((entry) => {
    if (entry.name !== currentName || entry.kind !== 'directory') {
      return entry;
    }

    if (remainingPath.length === 0) {
      return {
        ...entry,
        entries: childEntries,
      };
    }

    if (entry.entries === undefined) {
      return entry;
    }

    return {
      ...entry,
      entries: setDirectoryEntries(entry.entries, remainingPath, childEntries),
    };
  });
}

export function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'expandDir':
      // The asynchronous directory load is handled by App.
      return state;

    case 'directoryLoaded':
      return {
        ...state,
        view: {
          ...state.view,
          buffer: {
            ...state.view.buffer,
            entries: setDirectoryEntries(
              state.view.buffer.entries,
              action.path,
              action.entries,
            ),
          },
        },
      };

    // TODO: Malformed cases result in trying to fix state
    case 'nextEntry':
    case 'prevEntry': {
      const entries = state.view.buffer.entries;

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