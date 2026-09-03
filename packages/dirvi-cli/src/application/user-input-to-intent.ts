import { UserInput } from '../infrastructure/user-input.js';

export type Intent =
  | {
      intentType: 'interactRight';
    }
  | {
      intentType: 'interactLeft';
    }
  | {
      intentType: 'interactDown';
    }
  | {
      intentType: 'interactUp';
    }
  | {
      intentType: 'updateCommandBuffer';
      updatedCommandBuffer: string;
    };

function characterToIntent(
  character: string,
  commandBuffer: string,
): Intent | undefined {
  if (commandBuffer === '') {
    switch (character) {
      case 'l':
        return {
          intentType: 'interactRight',
        };

      case 'h':
        return {
          intentType: 'interactLeft',
        };

      case 'j':
        return {
          intentType: 'interactDown',
        };

      case 'k':
        return {
          intentType: 'interactUp',
        };
    }
  }

  return {
    intentType: 'updateCommandBuffer',
    updatedCommandBuffer: commandBuffer + character,
  };
}

// Derive the intent from the user input and the commandBuffer.
export function userInputToIntent(
  userInput: UserInput,
  commandBuffer: string,
): Intent | undefined {
  if (userInput.userInputType === 'esc') {
    return {
      intentType: 'updateCommandBuffer',
      updatedCommandBuffer: '',
    };
  }
  
  if (userInput.userInputType === 'character') {
    return characterToIntent(userInput.string, commandBuffer);
  }
  
  switch (userInput.userInputType) {
    case 'rightArrow':
      return {
        intentType: 'interactRight',
      };

    case 'leftArrow':
      return {
        intentType: 'interactLeft',
      };

    case 'downArrow':
      return {
        intentType: 'interactDown',
      };

    case 'upArrow':
      return {
        intentType: 'interactUp',
      };
  }
}