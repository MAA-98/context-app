import type { UnixDirectory, UnixEntry, UnixEntryName } from 'directory-app';
import { entryAtCursor } from './entry-at-cursor.js';

export type Cursor = UnixEntryName[];

export type View = {
  buffer: UnixDirectory;
  cursor: Cursor;
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
      kind: 'collapseDir';
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

function updateEntries(
  entries: UnixEntry[],
  currentPath: UnixEntryName[],
  newEntries: UnixEntry[] | undefined,
): UnixEntry[] {
  const [currentName, ...remainingPath] = currentPath;

  if (currentName === undefined) {
    throw new Error('Cannot update directory entries with an empty path');
  }
  
  let found = false;

  const updatedEntries = entries.map((entry) => {
    if (entry.name !== currentName) {
      return entry;
    }
    
    found = true;

    if (remainingPath.length === 0) {
      if (entry.kind !== 'directory') {
        throw new Error(
          `Cannot load entries for non-directory entry "${entry.name}" of kind "${entry.kind}"`,
        );
      }
      
      if (newEntries === undefined) {
        return {
          kind: 'directory' as const,
          name: entry.name,
        };
      }
      
      return {
        ...entry,
        entries: newEntries,
      };
    }
    
    if (entry.kind !== 'directory') {
      throw new Error(
        `Cannot descend through non-directory entry "${entry.name}"`,
      );
    }

    if (entry.entries === undefined) {
      throw new Error(
        `Cannot descend into unexpanded directory "${entry.name}"`,
      );
    }

    return {
      ...entry,
      entries: updateEntries(entry.entries, remainingPath, newEntries),
    };
  });
  
  if (!found) {
    throw new Error(`Directory path does not contain entry "${currentName}"`);
  }
  
  return updatedEntries;
}

function updateEntriesAtPath(
  buffer: UnixDirectory,
  path: UnixEntryName[],
  newEntries: UnixEntry[] | undefined,
): UnixDirectory {
  return {
    ...buffer,
    entries: updateEntries(buffer.entries, path, newEntries),
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'expandDir':
      // The asynchronous directory load is handled by App.
      return state;

    case 'collapseDir': {
      const cursor = state.view.cursor;

      if (cursor.length <= 1) {
        return state;
      }

      const collapsedCursor = cursor.slice(0, -1);

      return {
        ...state,
        view: {
          ...state.view,
          buffer: updateEntriesAtPath(
            state.view.buffer,
            collapsedCursor,
            undefined,
          ),
          cursor: collapsedCursor,
        },
      };
    }
    
    case 'directoryLoaded':
      const buffer = updateEntriesAtPath(
        state.view.buffer,
        action.path,
        action.entries,
      );

      const firstEntry = action.entries[0];

      return {
        ...state,
        view: {
          ...state.view,
          buffer,
          cursor:
            firstEntry === undefined
              ? action.path
              : [...action.path, firstEntry.name],
        },
      };

    // TODO: Malformed cases result in trying to fix state
    case 'nextEntry':
    case 'prevEntry': {
      const cursor = state.view.cursor;
      const currentName = cursor[cursor.length - 1];

      // If cursor is empty then currentName is undefined.
      if (currentName === undefined) {
        return state;
      }

      const parentEntry = entryAtCursor(state.view.buffer, cursor.slice(0, -1));

      const entries =
        cursor.length === 1
          ? state.view.buffer.entries
          : parentEntry?.kind === 'directory'
            ? parentEntry.entries
            : undefined;

      if (entries === undefined || entries.length === 0) {
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