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
