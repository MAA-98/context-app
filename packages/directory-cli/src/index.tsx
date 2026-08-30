#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';

import { getCwdAbsPath, getDirLazyEntries } from 'directory-app';
import type { UnixEntryName } from 'directory-app';

import { createFoldNode } from './application/folds.js';

import { AppProps, App } from './ui/App.js';

const program = new Command();

async function loadInitialProps(): Promise<AppProps> {
  const rootAddress = getCwdAbsPath();
  const lazyEntries = await getDirLazyEntries(rootAddress);

  const firstEntry = lazyEntries[0];
  const initialCursorPath: UnixEntryName[] =
    firstEntry === undefined ? [] : [firstEntry.name];
  
  return {
    rootAddress,
    initialView: {
      buffer: {
        entries: lazyEntries,
      },
      cursor: {
        kind: 'entry',
        path: initialCursorPath,
      },
      folds: createFoldNode(),
    },
  };
}

program
  .name('direx')
  .description('Manage (Unix-like) directories.')
  .version('0.1.0')
  .helpOption('--help')
  .action(async () => {
    const initialProps = await loadInitialProps()
    
    const app = render(<App {...initialProps} />);

    await app.waitUntilExit();
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`direx: ${message}`);
  process.exitCode = 1;
}