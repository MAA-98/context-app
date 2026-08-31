import type {
  UnixEntry,
  UnixEntryName,
  DirectoryBuffer,
  EntryPath,
} from 'directory-app';

export function namesEqual(
  left: UnixEntryName[],
  right: UnixEntryName[],
): boolean {
  return (
    left.length === right.length &&
    left.every((name, index) => name === right[index])
  );
}

export function pathsEqual(left: EntryPath, right: EntryPath): boolean {
  return namesEqual(left, right);
}

export function entryAtPath(
  buffer: DirectoryBuffer,
  path: EntryPath,
): UnixEntry | undefined {
  if (path.length === 0) {
    return undefined;
  }

  let entries = buffer.entries;
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
}