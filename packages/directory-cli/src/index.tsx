#!/usr/bin/env node
import { Command } from "commander";
import { render } from 'ink';
import { App } from './ui/App.js'

const program = new Command();

program
  .name("direx")
  .description("Manage (Unix-like) directories.")
  .version("0.1.0")
  .helpOption("--help")
  .action(async () => {
    const app = render(
      <App
        initial={{bool: true}}
      />,
    );
    
    await app.waitUntilExit();
  });

await program.parseAsync(process.argv);