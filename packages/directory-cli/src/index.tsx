#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';

import { loadInitialProps } from 'directory-app';
import { AppShell } from './ui/AppShell.js';

const program = new Command();

// ---*--- TERMINAL ALT SCREEN ---*---
// Restore the terminal during normal cleanup and as a
// last-resort fallback when Node is exiting.

// Write UI to stderr, so stdout can send messages to pipes
const uiOutput = process.stderr;

const enterAlternateScreen = '\u001b[?1049h\u001b[2J\u001b[H\u001b[?25l';
const leaveAlternateScreen = '\u001b[?25h\u001b[?1049l';

// Idempotent terminal restoration
let alternateScreenActive = false;
const restoreTerminal = () => {
  if (!alternateScreenActive) {
    return;
  }

  uiOutput.write(leaveAlternateScreen);
  alternateScreenActive = false;
};

// Node exit last resort
process.on('exit', restoreTerminal);

// ---*--- COMPOSITION ---*---
program
  .name('direx')
  .description('View and manage directories.')
  .version('0.1.0')
  .helpOption('--help')
  .action(async () => {
    const initialProps = await loadInitialProps();
    let appError: Error | undefined;

    const useAlternateScreen = uiOutput.isTTY === true;

    if (useAlternateScreen) {
      uiOutput.write(enterAlternateScreen);
      alternateScreenActive = true;
    }

    try {
      const app = render(
        <AppShell
          {...initialProps}
          onError={(error) => {
            appError = error;
          }}
        />,
        { stdout: uiOutput },
      );

      // Errors thrown while leaving this await still execute the finally block.
      await app.waitUntilExit();
    } finally {
      restoreTerminal(); // Always restore terminal regardless of error
    }

    // Re-throw an error reported by AppShell after the terminal
    // has been restored, so the outer catch can format it.
    if (appError !== undefined) {
      throw appError;
    }
  });

// ---*--- RUN AND HANDLE ERROR ---*---
try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  
  process.stderr.write(`direx: ${message}\n`);
  process.exitCode = 1;
}