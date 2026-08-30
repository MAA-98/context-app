import {
  UnixAbsolutePathSchema,
  type UnixAbsolutePath, UnixDirectory,
} from '../domain/directory.js';
import { getDirectoryEntries } from './get-dir-entries.js';

export function getCwdAbsPath(): UnixAbsolutePath {
  const currentWorkingDirectory = process.cwd();
  const result = UnixAbsolutePathSchema.safeParse(currentWorkingDirectory);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => issue.message)
      .join('; ');

    throw new Error(
      `Bad path for current working directory ` +
        `"${currentWorkingDirectory}": ${details}`,
    );
  }

  return result.data;
}

export async function getCwdDirectory(): Promise<UnixDirectory> {
  const rootAddress = getCwdAbsPath();
  const entries = await getDirectoryEntries(rootAddress);

  return {
    rootAddress,
    entries,
  };
}