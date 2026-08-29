export type TerminalSession = {
  enterPromptMode: () => void;
  leavePromptMode: () => void;
  close: () => void;
};