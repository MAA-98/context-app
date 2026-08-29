import type { Workspace, Intent } from "../domain/types.js";
import {LoadIntentFromWorkspace} from "../domain/contracts.js";

export function resolveIntentById(
  workspaces: Workspace[],
  id: string,
  loadIntentFromWorkspace: LoadIntentFromWorkspace
): { workspace: Workspace; intent: Intent } | undefined {
  for (const candidate of workspaces) {
    const intent = loadIntentFromWorkspace(candidate, id);
    if (intent) {
      return { workspace: candidate, intent };
    }
  }
  
  return undefined;
}