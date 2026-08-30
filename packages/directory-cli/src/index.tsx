#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';

import { getCwdDirectory } from 'directory-app';
import type { UnixEntryName, UnixDirectory } from 'directory-app';
import { App } from './ui/App.js';

const program = new Command();

program
  .name('direx')
  .description('Manage (Unix-like) directories.')
  .version('0.1.0')
  .helpOption('--help')
  .action(async () => {
    const initialDirectory: UnixDirectory = await getCwdDirectory();
    const firstEntry = initialDirectory.entries?.[0];
    const initialCursor: UnixEntryName[] =
      firstEntry === undefined ? [] : [firstEntry.name];

    const app = render(
      <App
        initial={{
          buffer: initialDirectory,
          view: {
            cursor: initialCursor,
          },
        }}
      />,
    );

    await app.waitUntilExit();
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`direx: ${message}`);
  process.exitCode = 1;
}