import { Cursor, DisplayRow, State } from 'dirvi-lib';
import { createDisplayRows } from '../application/display-rows.js';

export type ViewRowType = 'file' | 'directory' | 'fold';

// Encodes the display of blocks of rows, so renderer stays dumb
// by just writing all blocks in sequence.
//
// Id useful for React key.
export type ViewRow = {
  id: string;
  indent: number;
  selected: boolean;
  cursor: boolean;
  content: string;
  type: ViewRowType;
};

export type View = {
  rows: ViewRow[];
};

export const View = {
  create(
    state: State,
    viewportHeight: number,
    viewportStart: number,
  ): View {
    const displayRows = createDisplayRows(state.buffer, state.folds);

    const visibleDisplayRows = displayRows.slice(
      viewportStart,
      viewportStart + viewportHeight,
    );

    const rows = visibleDisplayRows.map((displayRow): ViewRow => {
      const cursor = Cursor.matchesDisplayRow(state.cursor, displayRow);

      return {
        id: id(displayRow),
        indent: displayRow.parentPath.length,
        selected: cursor,
        cursor,
        content: content(displayRow),
        type: type(displayRow),
      };
    });

    return {
      rows,
    };
  },
};

function id(row: DisplayRow): string {
  if (row.kind === 'entry') {
    return `entry:${JSON.stringify([...row.parentPath, row.entry.name])}`;
  }

  return `fold:${JSON.stringify(row.parentPath)}`;
}

function content(row: DisplayRow): string {
  if (row.kind === 'fold') {
    return `⋯ ${row.entryNames.length} folded entries`;
  }

  switch (row.entry.kind) {
    case 'file':
      return row.entry.name;

    case 'directory':
      return `${row.entry.name}/`;

    case 'symlink':
      return `${row.entry.name} -> ${row.entry.target}`;
  }
}

function type(row: DisplayRow): ViewRowType {
  if (row.kind === 'fold') {
    return 'fold';
  }

  switch (row.entry.kind) {
    case 'file':
      return 'file';

    case 'directory':
      return 'directory';

    case 'symlink':
      return 'file';
  }
}