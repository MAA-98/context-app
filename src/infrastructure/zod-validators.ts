import { z } from 'zod';
import type { ValidationResult, Validator } from '../domain/validation.js';
import { type ValidateIntent, type ValidateIntentBody } from "../domain/contracts.js";
import {
  CURRENT_INTENT_SCHEMA_VERSION,
  type Intent,
  type IntentId,
  type IntentBody,
  type Action,
  type Prompt,
  type ShellStep,
  type Workspace
} from "../domain/types.js";

// ---*--- ZOD SCHEMAS ---*---

/**
 * Make sure variables are good for shell environments, and prompts should be non-empty.
 */
const shellVarName = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const PromptSchema: z.ZodType<Prompt> = z.object({
  varName: z.string().min(1).regex(shellVarName, {
    message:
      'Must be a valid shell variable name (letters, numbers, underscores; cannot start with a digit).',
  }),
  prompt: z.string().min(1),
});

/**
 * Commands should be non-empty so there's something to run.
 */
export const ShellStepSchema: z.ZodType<ShellStep> = z.object({
  prompts: z.array(PromptSchema).default([]),
  command: z.string().min(1),
});

/**
 * Description is optional for now.
 */
export const ActionSchema: z.ZodType<Action> = z.object({
  desc: z.string().optional(),
  step: ShellStepSchema,
});

/**
 * Intent IDs are also directory names, so we keep them filesystem-friendly.
 * Give detailed messages for UI hints.
 */
const intentIdChars = /^[a-zA-Z0-9_-]+$/;
const intentIdStartsOk = /^[a-zA-Z0-9]/;

export const IntentIdSchema: z.ZodType<IntentId> = z
  .string()
  .min(1, { message: 'Must be non-empty.' })
  .refine((value) => intentIdStartsOk.test(value), {
    message: 'Must start with a letter or number.',
  })
  .refine((value) => intentIdChars.test(value), {
    message: 'May contain only letters, numbers, dashes, and underscores.',
  });

/**
 * The schema of the object actually saved to `intent.json`.
 * This is the on-disk body.
 */
export const IntentBodySchema = z.object({
  schemaVersion: z.literal(CURRENT_INTENT_SCHEMA_VERSION),
  shortDesc: z.string().min(1, { message: 'Must be non-empty.' }),
  longDesc: z.string().min(1, { message: 'Must be non-empty.' }),
  actions: z.array(ActionSchema).min(1),
});

/**
 * The full internal `Intent` type used by the application.
 * This is the on-disk body plus the filesystem-derived id.
 */
export const IntentSchema: z.ZodType<Intent> = IntentBodySchema.extend({
  id: IntentIdSchema,
  workspace: z.any(),
});

// ---*--- VALIDATOR IMPLEMENTATION ---*---

// --- SMALL HELPER ---
/**
 * Zod `safeParse` returns this input type, with `ZodError`.
 * We translate that to relevant ValidationResult.
 */
function fromSafeParse<T>(
  result:
    | { success: true; data: T }
    | { success: false; error: z.ZodError }
): ValidationResult<T> {
  return result.success
    ? {
      ok: true as const,
      value: result.data
    } : {
      ok: false as const,
      issues: result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      }))
    };
}

// Factory method
function makeValidator<T>(schema: z.ZodType<T>): Validator<T> {
  return (input) => fromSafeParse(schema.safeParse(input));
}

export const validatePrompt = makeValidator(PromptSchema);
export const validateShellStep = makeValidator(ShellStepSchema);
export const validateAction = makeValidator(ActionSchema);
export const validateIntentId = makeValidator(IntentIdSchema);
export const validateIntentBody: ValidateIntentBody = makeValidator(IntentBodySchema);
export const validateIntent: ValidateIntent = makeValidator(IntentSchema);