export type CursorPosition = {
  line: number;
  column: number;
};

/**
 * Clamps a number to the inclusive range [min, max].
 */
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Returns the starting character index of each line in a multiline string.
 *
 * Example:
 *   "a\nbc\n" -> [0, 2, 5]
 *
 * The first line always starts at index 0.
 */
export function getLineStarts(value: string): number[] {
  const starts = [0];
  
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\n') {
      starts.push(i + 1);
    }
  }
  
  return starts;
}

/**
 * Converts a character cursor index into line/column coordinate position.
 *
 * The cursor is a zero-based character index into the full string.
 * The returned line and column are zero-based as well.
 */
export function getCursorPosition(value: string, cursorIndex: number) {
  const starts = getLineStarts(value);
  
  let line = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= cursorIndex) {
      line = i;
    } else {
      break;
    }
  }
  
  const column = cursorIndex - starts[line];
  return { line, column, starts };
}

/**
 * Converts a line/column position into a character cursor index.
 *
 * The returned cursor is clamped so it never falls outside the string.
 */
export function getCursorIndex(value: string, position: CursorPosition) {
  const line = position.line;
  const col = position.column;
  
  const starts = getLineStarts(value);
  const safeLine = clamp(line, 0, starts.length - 1);
  
  const lineStart = starts[safeLine];
  const lineEnd =
    safeLine + 1 < starts.length ? starts[safeLine + 1] - 1 : value.length;
  
  return clamp(lineStart + col, lineStart, lineEnd);
}