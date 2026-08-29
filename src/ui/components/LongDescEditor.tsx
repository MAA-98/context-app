import { Box, Text, useApp, useInput } from 'ink';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { getCursorIndex, getCursorPosition } from './textEditing/textMethods.js';
import { TextEditorRender } from './textEditing/TextEditorRender.js';

type Props = {
  label: string;
  hint?: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  onEsc: () => void;
};

export function LongDescEditor({ label, text, setText, onSubmit, onEsc, hint }: Props) {
  const [cursorIndex, setCursorIndex] = useState(0);
  const [preferredCol, setPreferredCol] = useState<number | null>(null);
  const cursorPosition = useMemo(
    () => getCursorPosition(text, cursorIndex),
    [text, cursorIndex]
  );
  
  useInput((input, key) => {
    switch (true) {
      // ----- Leaving -----
      case key.escape:
        onEsc();
        return;
      case key.ctrl && input === 'n':
        onSubmit()
        return;
      // ----- Moving Cursor -----
      case key.leftArrow || key.rightArrow:
        setCursorIndex((c) => Math.max(0, key.leftArrow ? c - 1: c + 1));
        setPreferredCol(null);
        return;
      case key.upArrow || key.downArrow:
        const { line, column } = getCursorPosition(text, cursorIndex);
        const targetCol = preferredCol ?? column;
        const nextLine = key.upArrow ? line - 1 : line + 1;
        const nextCursor = getCursorIndex(text, { line: nextLine, column: targetCol });
        setCursorIndex(nextCursor);
        setPreferredCol(targetCol);
        return;
      // ----- Editing -----
      case key.backspace:
        if (cursorIndex === 0) return;
        setText((prev) => prev.slice(0, cursorIndex - 1) + prev.slice(cursorIndex));
        setCursorIndex((c) => c - 1);
        setPreferredCol(null);
        return;
      case key.delete:
        if (cursorIndex >= text.length) return;
        setText((prev) => prev.slice(0, cursorIndex) + prev.slice(cursorIndex + 1));
        setPreferredCol(null);
        return;
      case key.return:
        setText((prev) => prev.slice(0, cursorIndex) + '\n' + prev.slice(cursorIndex));
        setCursorIndex((c) => c + 1);
        setPreferredCol(null);
        return;
      case Boolean(input):
        setText((prev) => prev.slice(0, cursorIndex) + input + prev.slice(cursorIndex));
        setCursorIndex((c) => c + input.length);
        setPreferredCol(null);
    }
  });
  
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold>{label}</Text>
        {hint && <Text dimColor>{hint}</Text>}
      </Box>
      
      <TextEditorRender text={text} cursor={cursorPosition} />
    </Box>
  );
}