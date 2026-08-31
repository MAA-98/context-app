#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';

import { loadInitialProps } from 'directory-app';
import { AppShell } from './ui/AppShell.js';

const program = new Command();

program
  .name('direx')
  .description('View and manage directories.')
  .version('0.1.0')
  .helpOption('--help')
  .action(async () => {
    const initialProps = await loadInitialProps()
    const app = render(<AppShell {...initialProps} />);
    await app.waitUntilExit();
  });

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`direx: ${message}`);
  process.exitCode = 1;
}