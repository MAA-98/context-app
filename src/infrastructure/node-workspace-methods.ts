import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type {
  Workspace,
  Intent,
  IntentBody,
  IntentId,
} from '../domain/types.js';
import {
  ValidateIntentBody,
  CreateWorkspace,
  LoadIntentFromWorkspaceFactory,
  LoadIntentsFromWorkspaceFactory,
  ResolveWorkspaces,
  SaveIntentToWorkspace,
  DeleteIntentFromWorkspace,
} from '../domain/contracts.js';

// ---*--- WORKSPACE ---*---
export const createWorkspace: CreateWorkspace = (baseDir) => {
  const repoIntentsDir = join(baseDir, '.repo-intents');
  const intentsDir = join(repoIntentsDir, 'intents');

  if (!existsSync(repoIntentsDir)) {
    mkdirSync(repoIntentsDir, { recursive: true });
    mkdirSync(intentsDir, { recursive: true });
  } else {
    console.warn(`${repoIntentsDir} already exists`);
    if (!existsSync(intentsDir)) {
      mkdirSync(intentsDir, { recursive: true });
      console.warn(`Added ${intentsDir}`);
    }
    return;
  }

  console.log(`Created repo-intents workspace in ${baseDir}`);
};

/**
 * Walks upward from startDir to the filesystem root and collects every
 * directory that contains a `.repo-intents/` folder.
 *
 * Workspaces are returned in nearest-first order, so more specific nested
 * repo-intents directories can override or supplement parent definitions.
 */
export const resolveWorkspaces: ResolveWorkspaces = (startDir: string) => {
  const workspaces: Workspace[] = [];
  let current = resolve(startDir);

  while (true) {
    const candidate = join(current, '.repo-intents');

    if (existsSync(candidate)) {
      const pathMetadata = statSync(candidate);

      if (pathMetadata.isDirectory()) {
        workspaces.push({
          rootDir: current,
          repoIntentsDir: candidate,
          intentsDir: join(candidate, 'intents'),
        });
      }
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  // Nearest-first is usually best for overrides.
  return workspaces;
};

// ---*--- INTENT ---*---
export const saveIntentToWorkspace: SaveIntentToWorkspace = (
  workspace: Workspace,
  intent: Intent,
) => {
  const { id, workspace: trash, ...intentBody } = intent;
  const intentDir = join(workspace.intentsDir, id);
  const intentPath = join(intentDir, 'intent.json');

  mkdirSync(intentDir, { recursive: true });
  writeFileSync(intentPath, JSON.stringify(intentBody, null, 2) + '\n', 'utf8');
};

export const deleteIntentFromWorkspace: DeleteIntentFromWorkspace = (
  workspace: Workspace,
  intent: Intent,
) => {
  const { id } = intent;
  const intentDir = join(workspace.intentsDir, id);
  
  rmSync(intentDir, { recursive: true, force: true });
};

/**
 * Loads intent with given id from workspace.
 *
 * Expected layout:
 *   .repo-intents/
 *     intents/
 *       {some-intent-id}/
 *         intent.json
 *
 * The directory name is used as the intent id.
 * Factory method because validator is unspecified.
 */
export const loadIntentFromWorkspaceFactory: LoadIntentFromWorkspaceFactory =
  (validateIntentBody: ValidateIntentBody) =>
  (workspace: Workspace, id: IntentId) => {
    const intentPath = join(workspace.intentsDir, id, 'intent.json');

    if (!existsSync(intentPath)) {
      return undefined;
    }

    try {
      const raw = readFileSync(intentPath, 'utf8');
      const parsed = JSON.parse(raw);
      const validation = validateIntentBody(parsed);

      if (!validation.ok) {
        console.warn(`Invalid intent "${id}" in ${intentPath}:`);
        return undefined;
      }

      const body: IntentBody = validation.value;
      return {
        id,
        workspace,
        ...body,
      };
    } catch (err) {
      console.warn(`Failed to load intent "${id}":`, err);
      return undefined;
    }
  };

/**
 * Loads all repo intents from a workspace.
 */
export const loadIntentsFromWorkspaceFactory: LoadIntentsFromWorkspaceFactory =
  (loadIntentFromWorkspace) => (workspace: Workspace) => {
    const intentsDir = join(workspace.repoIntentsDir, 'intents');

    if (!existsSync(intentsDir)) {
      return [];
    }

    const dirContents = readdirSync(intentsDir, { withFileTypes: true });
    const intents: Intent[] = [];

    for (const entry of dirContents.filter((entry) => entry.isDirectory())) {
      const intent = loadIntentFromWorkspace(workspace, entry.name);
      if (intent) {
        intents.push(intent);
      }
    }

    return intents;
  };
