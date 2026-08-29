import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Action, Prompt } from '../../domain/types.js';
import { Panel } from './Panel.js';
import { SingleLineEditor } from './SingleLineEditor.js';

type Props = {
  label: string;
  hint?: string;
  actions: Action[];
  setActions: React.Dispatch<React.SetStateAction<Action[]>>;
  onBack: () => void;
  onDone: () => void;
};

function blankAction(): Action {
  return {
    desc: '',
    step: {
      prompts: [],
      command: '',
    },
  };
}

export function AddActions({ label, hint, actions, setActions, onBack, onDone }: Props) {
  const firstAction = actions[0] ?? blankAction();
  const [activeIndex, setActiveIndex] = useState(0); // floor /2 gives row, remainder gives column
  const activeRow = Math.floor(activeIndex / 2)
  const commandIndex = firstAction.step.prompts.length * 2;
  
  // Keep focus in range if prompts are added/removed.
  useEffect(() => {
    setActiveIndex((i) => Math.max(0, Math.min(i, commandIndex)));
  }, [commandIndex]);
  
  // Sets new action back to parent
  function updateActionAtIndex(index: number, updater: (action: Action) => Action) {
    setActions((prev) => {
      const next = [...prev];
      const current = next[index] ?? blankAction();
      next[index] = updater(current);
      return next;
    });
  }
  
  function updateCommand(text: string) {
    updateActionAtIndex(0, (action) => ({
      ...action,
      step: {
        ...action.step,
        command: text,
      },
    }));
  }
  
  function updatePrompt(index: number, updater: (prompt: Prompt) => Prompt) {
    updateActionAtIndex(0, (action) => {
      const prompts = [...action.step.prompts];
      const current = prompts[index] ?? { varName: '', prompt: '' };
      
      prompts[index] = updater(current);
      
      return {
        ...action,
        step: {
          ...action.step,
          prompts,
        },
      };
    });
  }
  
  function addPromptAboveActive() {
    updateActionAtIndex(0, (action) => {
      const prompts = [...action.step.prompts];
      prompts.splice(activeRow, 0, { varName: '', prompt: '' });
      
      return {
        ...action,
        step: {
          ...action.step,
          prompts,
        },
      };
    });
  }
  
  function deleteActivePrompt() {
    if (activeIndex >= commandIndex) return;
    
    const deleteAt = Math.floor(activeIndex / 2);
    const nextLen = Math.max(0, firstAction.step.prompts.length - 1);
    
    updateActionAtIndex(0, (action) => {
      const prompts = [...action.step.prompts];
      prompts.splice(deleteAt, 1);
      
      return {
        ...action,
        step: {
          ...action.step,
          prompts,
        },
      };
    });
    
    setActiveIndex((i) => Math.min(i, nextLen * 2));
  }
  
  useInput((input, key) => {
    switch (true) {
      case key.upArrow:
        setActiveIndex((i) => Math.max(0, i - 2));
        return;
      case key.downArrow:
        setActiveIndex((i) => Math.min(commandIndex, i + 2));
        return;
      case key.ctrl && input === 'a':
        addPromptAboveActive();
        return;
      case key.ctrl && input === 'd':
        deleteActivePrompt();
        return;
    }
  });
  
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold>{label}</Text>
        {hint &&
            <Text dimColor>
              {(activeIndex < commandIndex) &&'Ctrl+D:Delete Prompt | '}
              {hint}
            </Text>
        }
      </Box>
      
      <Box flexDirection="column">
        {/* ----- Prompts ----- */}
        {firstAction.step.prompts.length > 0 && (
          <Panel borderColor="gray">
            {firstAction.step.prompts.map((prompt, index) => (
              <Box key={index} flexDirection="row" width="100%">
                <Box flexGrow={1} flexBasis={0} marginRight={1}>
                  <SingleLineEditor
                    label={`Prompt ${index + 1}`}
                    prompt='Question: '
                    value={prompt.prompt}
                    setValue={(next) => {
                      const value =
                        typeof next === 'function'
                          ? next(prompt.prompt)
                          : next;
                      
                      updatePrompt(index, (current) => ({
                        ...current,
                        prompt: value,
                      }));
                    }}
                    active={activeIndex === index * 2}
                    onSubmit={() => setActiveIndex(Math.min(2 * index + 1, commandIndex))}
                    onBack={onBack}
                  />
                </Box>
              
                <Box flexGrow={1} flexBasis={0}>
                  <SingleLineEditor
                    label=' '
                    prompt='Variable Name: '
                    value={prompt.varName}
                    setValue={(next) => {
                      const value =
                        typeof next === 'function'
                          ? next(prompt.varName)
                          : next;
                      
                      updatePrompt(index, (current) => ({
                        ...current,
                        varName: value,
                      }));
                    }}
                    active={activeIndex === index * 2 + 1}
                    onSubmit={() => setActiveIndex(Math.min(2 * index + 2, commandIndex))}
                    onBack={onBack}
                  />
                </Box>
              </Box>
            ))}
          </Panel>
        )}
        
        <Panel>
          <SingleLineEditor
            label="Command"
            value={firstAction.step.command}
            setValue={(next) => {
              const value =
                typeof next === 'function'
                  ? next(firstAction.step.command)
                  : next;
              
              updateCommand(value);
            }}
            active={activeIndex === commandIndex}
            onSubmit={onDone}
            onBack={onBack}
          />
        </Panel>
      </Box>
    </Box>
  );
}