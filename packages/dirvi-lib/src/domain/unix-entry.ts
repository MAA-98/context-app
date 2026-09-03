import { z } from 'zod';
import { UnixPath } from './unix-path.js';

// UNIX ENTRY
export const UnixEntryNameSchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes('/'), {
    message: "Entry name must not contain '/'",
  })
  .refine((value) => value !== '.' && value !== '..', {
    message: "Entry name cannot be '.' or '..'",
  });

export type UnixEntryName = z.output<typeof UnixEntryNameSchema>;

export function entryNamesEqual(
  left: UnixEntryName[],
  right: UnixEntryName[],
): boolean {
  return (
    left.length === right.length &&
    left.every((name, index) => name === right[index])
  );
}

export type UnixEntry =
  | {
      kind: 'file';
      name: UnixEntryName;
    }
  | {
      kind: 'symlink';
      name: UnixEntryName;
      target: UnixPath;
    }
  | {
      kind: 'directory';
      name: UnixEntryName;
      // Undefined entries for lazy loading the 'buffer'
      entries?: UnixEntry[];
    };

export const UnixEntry = {
  // Query-Like
  getEntryAtPath(
    entries: UnixEntry[],
    path: UnixEntryPath,
  ): UnixEntry | undefined {
    if (path.length === 0) {
      return undefined;
    }

    let entry: UnixEntry | undefined;

    for (const [index, name] of path.entries()) {
      entry = entries.find((candidate) => candidate.name === name);

      if (entry === undefined) {
        return undefined;
      }

      if (index === path.length - 1) {
        return entry;
      }

      if (entry.kind !== 'directory' || entry.entries === undefined) {
        return undefined;
      }

      entries = entry.entries;
    }

    return undefined;
  },

  getEntriesAtPath(
    entries: UnixEntry[],
    path: UnixEntryPath,
  ): UnixEntry[] | undefined {
    if (path.length === 0) {
      return entries;
    }

    const entry = UnixEntry.getEntryAtPath(entries, path);

    if (entry?.kind !== 'directory') {
      return undefined;
    }

    return entry.entries;
  },

  // Command/Modifer-Like
  setEntriesAtPath(
    entries: UnixEntry[],
    path: UnixEntryPath,
    newEntries: UnixEntry[] | undefined,
  ): UnixEntry[] {
    const [currentName, ...remainingPath] = path;

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
            `Cannot update entries for non-directory entry "${entry.name}"`,
          );
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
        entries: UnixEntry.setEntriesAtPath(
          entry.entries,
          remainingPath,
          newEntries,
        ),
      };
    });

    if (!found) {
      throw new Error(`Directory path does not contain entry "${currentName}"`);
    }

    return updatedEntries;
  },
};

export type UnixEntryPath = UnixEntryName[];

export const UnixEntryPath = {
  equal(left: UnixEntryPath, right: UnixEntryPath): boolean {
    return entryNamesEqual(left, right);
  },
  
  isStrictPathPrefix(
    prefix: UnixEntryPath,
    path: UnixEntryPath,
  ): boolean {
    if (path.length <= prefix.length) {
      return false;
    }
    
    return prefix.every((name, index) => path[index] === name);
  }
}