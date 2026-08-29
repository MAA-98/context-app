import {Intent} from "../domain/types.js";
import {CollectPromptValues, CreateTerminalSession, RunShellCommand} from "./contracts.js";

/**
 * Runs an intent by collecting any prompt values needed for each action,
 * then executing the action's shell command.
 *
 * This use case owns the terminal session lifecycle so it can switch cleanly
 * between interactive prompt mode and normal shell execution mode.
 */
export async function runIntent(
  intent: Intent,
  createTerminalSession: CreateTerminalSession,
  collectPromptValues: CollectPromptValues,
  runShellCommand: RunShellCommand,
) {
  const terminalSession = createTerminalSession();
  // One terminal session is reused for the full intent run.
  // It is switched into prompt mode only while collecting prompt values,
  // then switched back before the shell command is executed.
  try {
    // Prompt collection needs a live terminal session.
    // We enter prompt mode only for the duration of readline input,
    // then return to normal shell mode before running the command.
    for (let i = 0; i < intent.actions.length; i++) {
      const action = intent.actions[i];
      const command = action.step.command;
      let variables = {};
      if (action.step.prompts.length > 0) {
        // Prompt mode keeps stdin/stdout alive while readline asks questions.
        terminalSession.enterPromptMode();
        try {
          variables = await collectPromptValues(action.step.prompts);
        } finally {
          terminalSession.leavePromptMode();
        }
      }
      
      console.log(`\x1b[32mRunning:\x1b[0m ${command}`); // Green 'Running: ' text
      const code = await runShellCommand(command, variables);
      
      if (code !== 0) {
        console.error(`Command failed with exit code ${code}`);
        process.exit(code);
      }
    }
  } finally {
    terminalSession.close();
  }
}