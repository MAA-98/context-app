import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Box, Text } from 'ink';

import type { Workspace, Intent } from '../../domain/types.js';
import type {
  DeleteIntentFromWorkspace,
  SaveIntentToWorkspace,
  ValidateIntent,
} from '../../domain/contracts.js';

import { createIntentDraft } from '../domain/intentDraft.js';
import { Panel } from '../components/Panel.js';
import { SingleLineEditor } from '../components/SingleLineEditor.js';
import { LongDescEditor } from '../components/LongDescEditor.js';
import { AddActions } from '../components/AddActions.js';
import {
  nextPhase,
  prevPhase,
  issueIsRelevant,
  formatIssueContext,
  type Phase,
} from '../domain/editIntentPhases.js';
import { start } from 'node:repl';

type Props = {
  workspace: Workspace;
  validateIntent: ValidateIntent;
  saveIntentToWorkspace: SaveIntentToWorkspace;
  deleteIntentFromWorkspace: DeleteIntentFromWorkspace;
  draft?: Intent;
  onExit: (message?: string) => void;
};

function bindStringField(
  setDraft: Dispatch<SetStateAction<Intent>>,
  field: 'id' | 'shortDesc' | 'longDesc',
): Dispatch<SetStateAction<string>> {
  return (next) => {
    setDraft((prev) => {
      const value = typeof next === 'function' ? next(prev[field]) : next;

      return {
        ...prev,
        [field]: value,
      };
    });
  };
}

export function IntentEditorScreen({
  workspace,
  validateIntent,
  saveIntentToWorkspace,
  deleteIntentFromWorkspace,
  draft: startingDraft,
  onExit,
}: Props) {
  // ----- Editing Steps -----
  const [phase, setPhase] = useState<Phase>('id');

  // ----- Draft and Validation ----
  const [draft, setDraft] = useState<Intent>(
    () => startingDraft ?? createIntentDraft(workspace),
  );
  const validation = useMemo(
    () => validateIntent(draft),
    [draft, validateIntent],
  );
  const validationIssues = validation.ok ? [] : validation.issues;
  const relevantIssues = validationIssues.filter((issue) =>
    issueIsRelevant(issue, phase),
  );
  const errExists = relevantIssues.length > 0;
  const compiledIntent = validation.ok ? validation.value : null;

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box marginTop={1}>
        <Text bold>{startingDraft ? 'Edit Intent ' : 'New Intent '}</Text>
        <Text>in {workspace.rootDir}</Text>
      </Box>

      <Panel flexGrow={1} borderColor={errExists ? 'red' : 'blue'}>
        {phase === 'id' && (
          <SingleLineEditor
            label="1/4: ID"
            hint={errExists ? 'Esc:Quit' : '⏎:Continue | Esc:Quit'}
            value={draft.id}
            setValue={bindStringField(setDraft, 'id')}
            onSubmit={() => !errExists && setPhase(nextPhase)}
            onBack={() => onExit()}
          />
        )}

        {phase === 'shortDesc' && (
          <SingleLineEditor
            label="2/4: One Line Description"
            hint={errExists ? 'Esc:Quit' : '⏎:Continue | Esc:Back'}
            value={draft.shortDesc}
            setValue={bindStringField(setDraft, 'shortDesc')}
            onSubmit={() => !errExists && setPhase(nextPhase)}
            onBack={() => setPhase(prevPhase)}
          />
        )}

        {phase === 'longDesc' && (
          <LongDescEditor
            label="3/4: Long Description"
            hint={
              errExists
                ? '⏎:New line | Esc:Back'
                : 'Ctrl+N: Next | ⏎:New line | Esc:Back'
            }
            text={draft.longDesc}
            setText={bindStringField(setDraft, 'longDesc')}
            onSubmit={() => !errExists && setPhase(nextPhase)}
            onEsc={() => setPhase(prevPhase)}
          />
        )}

        {phase === 'actions' && (
          <AddActions
            label="4/4: Actions"
            hint={
              errExists
                ? 'Ctrl+A:Add Prompt Above | ⏎:Next Field | Esc:Back'
                : 'Ctrl+S:Submit | Ctrl+A:Add Prompt Above | ⏎:Next Field | Esc:Back'
            }
            actions={draft.actions}
            setActions={(next) =>
              setDraft((prev) => ({
                ...prev,
                actions: typeof next === 'function' ? next(prev.actions) : next,
              }))
            }
            onBack={() => setPhase(prevPhase)}
            onDone={() => {
              if (!compiledIntent) return;

              try {
                if (startingDraft) deleteIntentFromWorkspace(workspace, startingDraft);
                saveIntentToWorkspace(workspace, compiledIntent);
                onExit(`Saved intent for "${workspace.rootDir}".`);
              } catch (err) {
                onExit(
                  `Failed to save intent: ${err instanceof Error ? err.message : String(err)}`,
                );
              }
            }}
          />
        )}
      </Panel>

      {/* Validation Errors */}
      <Box>
        {errExists ? (
          <Box flexDirection="column">
            <Text color="red" bold>
              Validation errors
            </Text>
            {relevantIssues.map((issue, i) => (
              <Text key={`${issue.path.join('.')}-${i}`} color="red">
                - {formatIssueContext(issue, phase)} {issue.message}
              </Text>
            ))}
          </Box>
        ) : compiledIntent ? (
          <Text color="green">Intent is valid and ready to save</Text>
        ) : (
          <Text dimColor>Intent is incomplete</Text>
        )}
      </Box>
    </Box>
  );
}
