import type { UnixEntry, DirectoryBuffer, EntryPath } from 'dirvi-lib';

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
