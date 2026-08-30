import type { UnixDirectory, UnixEntry } from 'directory-app';
import type { Cursor } from './state.js';

export function entryAtCursor(
  directory: UnixDirectory,
  cursor: Cursor,
): UnixEntry | undefined {
  let entries = directory.entries;
  let entry: UnixEntry | undefined;

  for (const name of cursor) {
    entry = entries.find((candidate) => candidate.name === name);

    if (entry === undefined) {
      return undefined;
    }

    if (entry.kind === 'directory' && entry.entries !== undefined) {
      entries = entry.entries;
    }
  }

  return entry;
}
