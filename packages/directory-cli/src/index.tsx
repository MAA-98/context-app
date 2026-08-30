#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';

import { getCwdAbsPath, getDirLazyEntries } from 'directory-app';
import type { UnixEntryName } from 'directory-app';

import type { State } from './application/state.js';
import { createFoldNode } from './application/folds.js';

import { App } from './ui/App.js';

const program = new Command();

async function loadInitialState(): Promise<State> {
  const rootAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(rootAddress);

  const firstEntry = lazyEntries[0];
  const initialCursor: UnixEntryName[] =
    firstEntry === undefined ? [] : [firstEntry.name];
  
  return {
    view: {
      buffer: {
        rootAddress,
        entries: lazyEntries
      },
      cursor: initialCursor,
      folds: createFoldNode()
    }
  }
}

program
  .name('direx')
  .description('Manage (Unix-like) directories.')
  .version('0.1.0')
  .helpOption('--help')
  .action(async () => {
    const initialState = await loadInitialState()
    
    const app = render(<App initialState={initialState} />);

    await app.waitUntilExit();
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`direx: ${message}`);
  process.exitCode = 1;
}