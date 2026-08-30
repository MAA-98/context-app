import {
  UnixAbsolutePathSchema,
  type UnixAbsolutePath,
} from '../domain/directory.js';

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