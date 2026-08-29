import type { Workspace, Intent } from '../../domain/types.js';
import type { SaveIntentToWorkspace, ValidateIntent } from '../../domain/contracts.js';

export type IntentEditorScreen = {
  kind: 'IntentEditor';
  workspace: Workspace;
  draft?: Intent;
};

export type SearchIntentsScreen = {
  kind: 'SearchIntents';
  intents: Intent[];
  initialQuery?: string;
  onSubmit: (intent: Intent) => void;
};

export type Screen = IntentEditorScreen | SearchIntentsScreen;