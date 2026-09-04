import {
  Cursor,
  NavigationEntry,
  NavigationNode,
  UnixEntryPath,
} from 'dirvi-lib';

export type ViewRowType = 'file' | 'directory' | 'fold';

// Encodes the display of blocks of rows, so renderer stays dumb
// by just writing all blocks in sequence.
//
// id useful for React key.
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
  createRows(navigation: NavigationNode, cursor: Cursor): ViewRow[] {
    return viewRowsAtNode(navigation, [], cursor);
  },

  create(
    navigation: NavigationNode,
    cursor: Cursor,
    viewportHeight: number,
    viewportStart: number,
  ): View {
    const rows = View.createRows(navigation, cursor);

    return {
      rows: rows.slice(viewportStart, viewportStart + viewportHeight),
    };
  },
};

function viewRowsAtNode(
  node: NavigationNode,
  parentPath: UnixEntryPath,
  cursor: Cursor,
): ViewRow[] {
  const rows: ViewRow[] = [];

  for (const entry of node.entries) {
    const isCursor =
      cursor.kind === 'entry' &&
      UnixEntryPath.equal(cursor.parentPath, parentPath) &&
      cursor.entryName === entry.name;

    rows.push(viewRowForEntry(entry, parentPath, isCursor));

    if (entry.kind !== 'directory' || entry.node === undefined) {
      continue;
    }

    rows.push(
      ...viewRowsAtNode(entry.node, [...parentPath, entry.name], cursor),
    );
  }

  if (node.foldedEntries.length > 0) {
    const isCursor =
      cursor.kind === 'fold' &&
      UnixEntryPath.equal(cursor.parentPath, parentPath);

    rows.push({
      id: foldId(parentPath),
      indent: parentPath.length,
      selected: isCursor,
      cursor: isCursor,
      content: `⋯ ${node.foldedEntries.length} folded`,
      type: 'fold',
    });
  }

  return rows;
}

function viewRowForEntry(
  entry: NavigationEntry,
  parentPath: UnixEntryPath,
  cursor: boolean,
): ViewRow {
  return {
    id: entryId(parentPath, entry.name),
    indent: parentPath.length,
    selected: cursor,
    cursor,
    content: content(entry),
    type: type(entry),
  };
}

function entryId(parentPath: UnixEntryPath, entryName: string): string {
  return `entry:${JSON.stringify([...parentPath, entryName])}`;
}

function foldId(parentPath: UnixEntryPath): string {
  return `fold:${JSON.stringify(parentPath)}`;
}

function content(entry: NavigationEntry): string {
  switch (entry.kind) {
    case 'file':
      return entry.name;

    case 'directory':
      return `${entry.name}/`;

    case 'symlink':
      return `${entry.name} -> ${entry.target}`;
  }
}

function type(entry: NavigationEntry): ViewRowType {
  switch (entry.kind) {
    case 'file':
      return 'file';

    case 'directory':
      return 'directory';

    case 'symlink':
      return 'file';
  }
}
