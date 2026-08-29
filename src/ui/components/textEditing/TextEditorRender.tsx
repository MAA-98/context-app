import { clamp, type CursorPosition } from "./textMethods.js";
import { Box, Text } from 'ink';

/**
 * Renders one line of text with a single character of inverted color
 * to represent the cursor position.
 */
function renderLineWithCursor(line: string, cursorCol: number) {
  const safeCol = clamp(cursorCol, 0, line.length);
  
  const before = line.slice(0, safeCol);
  const cursorChar = line[safeCol] ?? ' ';
  const after = line.slice(safeCol + 1);
  
  return (
    <Text>
      {before}
      <Text inverse>{cursorChar}</Text>
      {after}
    </Text>
  );
}

type Props = {
  text: string;
  cursor: CursorPosition;
};

/**
 * Renders the visible contents of a multiline text editor.
 *
 * The line containing the cursor is rendered specially so the cursor
 * character is highlighted.
 */
export function TextEditorRender({ text, cursor }: Props) {
  const lines = text.split('\n');
  
  return (
    <Box flexDirection="column" marginTop={1}>
      {lines.map((line, i) => {
        if (i === cursor.line) {
          return <Text key={i}>{renderLineWithCursor(line, cursor.column)}</Text>;
        }
        
        return (
          <Text key={i}>
            {line === '' ? <Text dimColor> </Text> : line}
          </Text>
        );
      })}
    </Box>
  );
}