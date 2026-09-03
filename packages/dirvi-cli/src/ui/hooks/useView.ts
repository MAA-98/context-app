import { Cursor, DisplayRow, State } from 'dirvi-lib';
import { View } from '../view.js';
import { useWindowSize } from 'ink';
import { useRef } from 'react';
import { createDisplayRows } from '../../application/display-rows.js';

// Hooks that keeps Ref of the viewport's start, and returns View sliced to
// only the rows that should be visible.
export function useView(state: State): View {
  const { rows: terminalRows } = useWindowSize();
  const viewportStartRef = useRef(0);

  const viewportHeight = Math.max(1, terminalRows);
  const displayRows = createDisplayRows(state.buffer, state.folds);

  viewportStartRef.current = viewportStart(
    displayRows,
    state,
    viewportHeight,
    viewportStartRef.current,
  );

  return View.create(state, viewportHeight, viewportStartRef.current);
}

function viewportStart(
  rows: DisplayRow[],
  state: State,
  viewportHeight: number,
  currentViewportStart: number,
): number {
  const scrollMargin = 3;
  const cursorIndex = rows.findIndex((row) =>
    Cursor.matchesDisplayRow(state.cursor, row),
  );

  const maximumViewportStart = Math.max(0, rows.length - viewportHeight);

  let viewportStart = currentViewportStart;

  if (cursorIndex >= 0) {
    const firstVisibleCursorIndex = viewportStart + scrollMargin;

    const lastVisibleCursorIndex =
      viewportStart + viewportHeight - 1 - scrollMargin;

    if (cursorIndex < firstVisibleCursorIndex) {
      viewportStart = cursorIndex - scrollMargin;
    } else if (cursorIndex > lastVisibleCursorIndex) {
      viewportStart = cursorIndex - viewportHeight + 1 + scrollMargin;
    }
  }

  return Math.max(0, Math.min(viewportStart, maximumViewportStart));
}