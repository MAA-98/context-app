import type { UnixEntryName } from './unix-entry.js';

export type FoldNode = {
  children: Record<UnixEntryName, FoldNode>;
  folds: UnixEntryName[];
};

export const FoldNode = {
  createEmpty(): FoldNode {
    return {
      children: Object.create(null) as Record<UnixEntryName, FoldNode>,
      folds: [],
    };
  },
  
  updateAtPath(
    rootNode: FoldNode,
    path: UnixEntryName[],
    update: (targetNode: FoldNode) => FoldNode,
  ): FoldNode {
    const [currentName, ...remainingPath] = path;
    
    // Base case
    if (currentName === undefined) {
      return update(rootNode);
    }
    
    // Create childNode to create path in tree to the needed node
    const childNode = rootNode.children[currentName] ?? FoldNode.createEmpty();
    
    return {
      ...rootNode,
      children: {
        ...rootNode.children,
        [currentName]: FoldNode.updateAtPath(childNode, remainingPath, update),
      },
    };
  }
};