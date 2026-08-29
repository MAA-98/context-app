// ---*--- ACTIONS ---*---

/**
 * A prompt is a question asked before running a shell command.
 * The answer is stored under `varName` and can be interpolated into the command.
 */
export type Prompt = {
  prompt: string;
  varName: string;
};

/**
 * Every action step is a shell step.
 * Each shell step owns its own prompts, making the step self-contained.
 */
export type ShellStep = {
  prompts: Prompt[];
  command: string;
};

/**
 * An action is a description and a shell step.
 */
export type Action = {
  desc?: string;
  step: ShellStep;
};

// ---*--- INTENT ---*---

export const CURRENT_INTENT_SCHEMA_VERSION = 1 as const;

export type IntentId = string;

export type IntentBody = {
  schemaVersion: typeof CURRENT_INTENT_SCHEMA_VERSION;
  shortDesc: string;
  longDesc: string;
  actions: Action[];
};

export type Intent = IntentBody & {
  id: IntentId;
  workspace: Workspace;
};

// ---*--- WORKSPACE ---*---

export type Workspace = {
  rootDir: string;
  repoIntentsDir: string;
  intentsDir: string;
};