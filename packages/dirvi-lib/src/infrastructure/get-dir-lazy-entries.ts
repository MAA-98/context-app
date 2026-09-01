import { readdir, readlink } from 'node:fs/promises';
import { join } from 'node:path';

import type { UnixAbsolutePath } from '../domain/unix-path.js';
import { UnixPathSchema } from '../domain/unix-path.js';
import type { UnixEntry } from '../domain/unix-entry.js';
import { UnixEntryNameSchema } from '../domain/unix-entry.js';

export async function getDirLazyEntries(
  address: UnixAbsolutePath,
): Promise<UnixEntry[]> {
  const directoryEntries = await readdir(address, {
    withFileTypes: true,
  });

  return Promise.all(
    directoryEntries.map(async (directoryEntry): Promise<UnixEntry> => {
      const name = UnixEntryNameSchema.parse(directoryEntry.name);

      if (directoryEntry.isSymbolicLink()) {
        const target = UnixPathSchema.parse(
          await readlink(join(address, directoryEntry.name)),
        );

        return {
          kind: 'symlink',
          name,
          target,
        };
      }

      if (directoryEntry.isDirectory()) {
        return {
          kind: 'directory',
          name,
          // Deliberately omitted: this directory has not been expanded.
        };
      }

      if (directoryEntry.isFile()) {
        return {
          kind: 'file',
          name,
        };
      }

      throw new Error(
        `Unsupported filesystem entry "${join(address, directoryEntry.name)}"`,
      );
    }),
  );
}
