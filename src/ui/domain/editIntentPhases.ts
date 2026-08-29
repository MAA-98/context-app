import type { ValidationIssue } from '../../domain/validation.js';

export const phases = ['id', 'shortDesc', 'longDesc', 'actions'] as const;
export type Phase = (typeof phases)[number];

export function nextPhase(phase: Phase): Phase {
  const index = phases.indexOf(phase);
  return phases[(index + 1) % phases.length];
}

export function prevPhase(phase: Phase): Phase {
  const index = phases.indexOf(phase);
  return phases[(index - 1 + phases.length) % phases.length];
}

const phaseRoots: Record<Phase, readonly string[]> = {
  id: ['id'],
  shortDesc: ['shortDesc'],
  longDesc: ['longDesc'],
  actions: ['actions'],
};

export function issueIsRelevant(issue: ValidationIssue, phase: Phase): boolean {
  // Root-level issues can be shown for the active screen.
  if (issue.path.length === 0) return true;
  
  const root = String(issue.path[0]);
  return phaseRoots[phase].includes(root);
}

export function formatIssueContext(issue: ValidationIssue, phase: Phase): string {
  // examples:
  // actions.0.desc
  // actions.0.step.command
  // actions.0.step.prompts.0.prompt
  // actions.0.step.prompts.0.varName
  if (phase === 'actions' && String(issue.path[0]) === 'actions' && issue.path[1] === 0) {
    if (issue.path[2] === 'desc') {
      return 'Description: ';
    }
    if (issue.path[2] === 'step') {
      if (issue.path[3] === 'command') {
        return 'Command: ';
      }
      if (issue.path[3] === 'prompts') {
        if (typeof issue.path[4] === 'number') {
          const promptIndex = Number(issue.path[4]);
          if (issue.path[5] === 'prompt') {
            return `Prompt ${promptIndex + 1} Question:`;
          }
          if (issue.path[5] === 'varName') {
            return `Prompt ${promptIndex + 1} Variable:`;
          }
        }
      }
    }
  }
  
  return '';
}