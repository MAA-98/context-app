import type { Workspace, Intent, IntentBody, IntentId} from "./types.js";
import type { Validator } from './validation.js';

// ---*--- VALIDATION ---*---
export type ValidateIntentBody = Validator<IntentBody>;
export type ValidateIntent = Validator<Intent>;

// ---*--- WORKSPACE ---*---
export type CreateWorkspace = (baseDir: string) => void;
export type ResolveWorkspaces = (startDir: string) => Workspace[]; // Workspaces are returned in array, prioritizing intents from earlier workspaces.

// ---*--- INTENT ---*---
export type SaveIntentToWorkspace = (
  workspace: Workspace,
  intent: Intent,
) => void;
export type DeleteIntentFromWorkspace = (
  workspace: Workspace,
  intent: Intent,
) => void;

export type LoadIntentFromWorkspace = (workspace: Workspace, id: string) => Intent | undefined;
export type LoadIntentFromWorkspaceFactory = (
  validateIntentBody: ValidateIntentBody
) => LoadIntentFromWorkspace;
export type LoadIntentsFromWorkspace = (workspace: Workspace) => Intent[];
export type LoadIntentsFromWorkspaceFactory = (
  loadIntentFromWorkspace: (workspace: Workspace, id: IntentId) => Intent | undefined
) => LoadIntentsFromWorkspace;

// ---*--- ACTION STEPS ---*---
export type Prompt = { varName: string; prompt: string }
