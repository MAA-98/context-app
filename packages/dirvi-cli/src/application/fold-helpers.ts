import type { UnixEntry, UnixEntryName } from 'dirvi-lib';
import { FoldNode } from 'dirvi-lib';

export function hasFold(node: FoldNode, entryName: UnixEntryName): boolean {
  return node.folds.includes(entryName);
}

export function entryIsFolded(
  node: FoldNode | undefined,
  entry: UnixEntry,
): boolean {
  return node !== undefined && hasFold(node, entry.name);
}

// Replaces all folds at a node
export function setFolds(node: FoldNode, entries: UnixEntry[]): FoldNode {
  const entryNames = entries.map((entry) => entry.name);

  return {
    ...node,
    folds: entryNames,
  };
}

export function addFold(node: FoldNode, entryName: UnixEntryName): FoldNode {
  if (hasFold(node, entryName)) {
    return node;
  }

  return {
    ...node,
    folds: [...node.folds, entryName],
  };
}

export function unfoldFoldSequence(
  node: FoldNode,
  entries: UnixEntry[],
  entryName: UnixEntryName,
): FoldNode {
  const entryIndex = entries.findIndex((entry) => entry.name === entryName);

  if (entryIndex === -1 || !hasFold(node, entryName)) {
    return node;
  }

  let firstIndex = entryIndex;

  while (firstIndex > 0 && hasFold(node, entries[firstIndex - 1].name)) {
    firstIndex -= 1;
  }

  let lastIndex = entryIndex;

  while (
    lastIndex < entries.length - 1 &&
    hasFold(node, entries[lastIndex + 1].name)
  ) {
    lastIndex += 1;
  }

  const unfoldedNames = new Set(
    entries.slice(firstIndex, lastIndex + 1).map((entry) => entry.name),
  );

  return {
    ...node,
    folds: node.folds.filter((foldedName) => !unfoldedNames.has(foldedName)),
  };
}
