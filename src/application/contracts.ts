import {Prompt} from "../domain/contracts.js";
import {TerminalSession} from "./types.js";

export type CreateTerminalSession = () => TerminalSession;
export type CollectPromptValues = (prompts: Prompt[]) => Promise<Record<string, string>>;
export type RunShellCommand = (command: string, env?: Record<string, string>) => Promise<number>;