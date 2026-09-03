import type { Key } from 'ink';

export type UserInput =
  | {
      userInputType: 'character';
      string: string;
    }
  | {
      userInputType: 'esc';
    }
  | {
      userInputType: 'rightArrow';
    }
  | {
      userInputType: 'leftArrow';
    }
  | {
      userInputType: 'downArrow';
    }
  | {
      userInputType: 'upArrow';
    };

// Interprets raw user input to typed UserInput.
export function inkInputToUserInput(
  input: string,
  key: Key,
): UserInput | undefined {
  if (key.escape) {
    return {
      userInputType: 'esc',
    };
  }

  if (key.rightArrow) {
    return {
      userInputType: 'rightArrow',
    };
  }

  if (key.leftArrow) {
    return {
      userInputType: 'leftArrow',
    };
  }

  if (key.upArrow) {
    return {
      userInputType: 'upArrow',
    };
  }

  if (key.downArrow) {
    return {
      userInputType: 'downArrow',
    };
  }

  if (input !== '') {
    return {
      userInputType: 'character',
      string: input,
    };
  }

  return undefined;
}
