import { z } from 'zod';

// UNIX PATHS
export const UnixPathSchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes('\0'), {
    message: 'Unix paths must not contain null bytes',
  });

export type UnixPath = z.output<typeof UnixPathSchema>;

export const UnixAbsolutePathSchema = UnixPathSchema.refine(
  (value) => value.startsWith('/'),
  {
    message: 'Path must be an absolute Unix path',
  },
);

export type UnixAbsolutePath = z.output<typeof UnixAbsolutePathSchema>;

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

export type UnixEntryName = z.output<typeof UnixEntryNameSchema>

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

// UNIX DIR

export type UnixDirectory = {
  rootAddress: UnixAbsolutePath;
  entries: UnixEntry[];
};