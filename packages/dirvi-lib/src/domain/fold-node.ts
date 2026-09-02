import { UnixEntry, UnixEntryName, UnixEntryPath } from './unix-entry.js';

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[];
};

export const FoldNode = {
  // Query-Like
  getAtPath(rootNode: FoldNode, path: UnixEntryPath): FoldNode | undefined {
    const [currentName, ...remainingPath] = path;

    if (currentName === undefined) {
      return rootNode;
    }

    const childNode = rootNode.children[currentName];

    if (childNode === undefined) {
      return undefined;
    }

    return FoldNode.getAtPath(childNode, remainingPath);
  },

  getIfEntryFolded(node: FoldNode | undefined, entry: UnixEntry): boolean {
    return node !== undefined && hasFoldedEntryNamed(node, entry.name);
  },

  // Command/Modifer-Like
  modifyAtPath(
    rootNode: FoldNode,
    path: UnixEntryName[],
    modifier: (targetNode: FoldNode) => FoldNode,
  ): FoldNode {
    const [currentName, ...remainingPath] = path;

    // Base case
    if (currentName === undefined) {
      return modifier(rootNode);
    }

    // Create childNode to create path in tree to the needed node
    const childNode = rootNode.children[currentName] ?? FoldNode.createEmpty();

    return {
      ...rootNode,
      children: {
        ...rootNode.children,
        [currentName]: FoldNode.modifyAtPath(
          childNode,
          remainingPath,
          modifier,
        ),
      },
    };
  },

  addFoldedEntry(node: FoldNode, entry: UnixEntry): FoldNode {
    // Avoid duplicates
    if (hasFoldedEntryNamed(node, entry.name)) {
      return node;
    }

    return setFoldedEntriesNamed(node, [...node.folds, entry.name]);
  },

  addFoldedEntryAtPath(
    rootNode: FoldNode,
    path: UnixEntryName[],
    entry: UnixEntry,
  ): FoldNode {
    return FoldNode.modifyAtPath(rootNode, path, (node) =>
      FoldNode.addFoldedEntry(node, entry),
    );
  },

  createEmpty(): FoldNode {
    return {
      children: Object.create(null) as Record<UnixEntryName, FoldNode>,
      folds: [],
    };
  },

  setFoldedEntries(node: FoldNode, entries: UnixEntry[]): FoldNode {
    return setFoldedEntriesNamed(
      node,
      entries.map((entry) => entry.name),
    );
  },

  removeFoldedEntry(node: FoldNode, entry: UnixEntry): FoldNode {
    if (!hasFoldedEntryNamed(node, entry.name)) {
      return node;
    }

    return setFoldedEntriesNamed(
      node,
      node.folds.filter((entryName) => entryName !== entry.name),
    );
  },

  clearFoldedEntries(node: FoldNode): FoldNode {
    if (node.folds.length === 0) {
      return node;
    }

    return setFoldedEntriesNamed(node, []);
  },
};

// PRIVATE HELPERS

// Queries
function hasFoldedEntryNamed(node: FoldNode, entryName: UnixEntryName): boolean {
  return node.folds.includes(entryName);
}

function uniqueEntryNames(entryNames: UnixEntryName[]): UnixEntryName[] {
  return [...new Set(entryNames)];
}

// Adding
function setFoldedEntriesNamed(node: FoldNode, entryNames: UnixEntryName[]): FoldNode {
  const uniqueNames = uniqueEntryNames(entryNames);
  
  return {
    ...node,
    folds: uniqueNames,
  };
}