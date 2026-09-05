export type NameEquals<Name> = (left: Name, right: Name) => boolean;

type TreeNodeBase<Name> = {
  name: Name;
};

export type TreeNodeLeaf<Name> = TreeNodeBase<Name> & {
  branches?: never;
};

// ChildNode is the generic type for the actual full type that
// makes up the tree entries.
//
// Note: `null` branches means not loaded.
//
// ASSUMPTION:
// Among branches of a node, names are unique.
export type TreeNodeBranch<
  Name,
  ChildNode extends TreeNode<Name, ChildNode>,
> = TreeNodeBase<Name> & {
  branches: ChildNode[] | null;
};

export type TreeNode<Name, ChildNode extends TreeNode<Name, ChildNode>> =
  | TreeNodeLeaf<Name>
  | TreeNodeBranch<Name, ChildNode>;

// ChildNode is a type that extends TreeNode<Name>, and is the main
// tree node type of interest.
export type TreeNodeApi<Name, ChildNode extends TreeNode<Name, ChildNode>> = {
  isTreeNodeBranch(
    node: ChildNode,
  ): node is ChildNode & TreeNodeBranch<Name, ChildNode>;

  isTreeNodeLeaf(node: ChildNode): node is ChildNode & TreeNodeLeaf<Name>;

  getBranches(node: ChildNode): ChildNode[] | null | undefined;

  getAtPath(entries: ChildNode[], path: Name[]): ChildNode | undefined;

  setAtPath(
    entries: ChildNode[],
    path: Name[],
    replacement: ChildNode,
  ): ChildNode[] | undefined;

  setBranchesAtPath(
    entries: ChildNode[],
    path: Name[],
    newBranches: ChildNode[] | null,
  ): ChildNode[] | undefined;
};

export function createTreeNodeApi<
  Name,
  ChildNode extends TreeNode<Name, ChildNode>,
>(nameEquals: NameEquals<Name>): TreeNodeApi<Name, ChildNode> {
  const treeNode: TreeNodeApi<Name, ChildNode> = {
    isTreeNodeBranch(
      node,
    ): node is ChildNode & TreeNodeBranch<Name, ChildNode> {
      return 'branches' in node;
    },

    isTreeNodeLeaf(node): node is ChildNode & TreeNodeLeaf<Name> {
      return !treeNode.isTreeNodeBranch(node);
    },

    getBranches(node) {
      return treeNode.isTreeNodeBranch(node) ? node.branches : undefined;
    },

    getAtPath(entries, path) {
      if (path.length === 0) {
        return undefined;
      }

      for (const [index, name] of path.entries()) {
        const node = entries.find((candidate) =>
          nameEquals(candidate.name, name),
        );

        if (node === undefined) {
          return undefined;
        }

        if (index === path.length - 1) {
          return node;
        }

        if (!treeNode.isTreeNodeBranch(node)) {
          return undefined;
        }

        if (node.branches === null) {
          // The node is a branch, but its children have not been loaded.
          return undefined;
        }

        entries = node.branches;
      }

      return undefined;
    },

    setAtPath(entries, path, replacement) {
      const [currentName, ...remainingPath] = path;

      if (currentName === undefined) {
        return undefined;
      }

      const childIndex = entries.findIndex((candidate) =>
        nameEquals(candidate.name, currentName),
      );

      if (childIndex === -1) {
        return undefined;
      }

      const child = entries[childIndex];

      let updatedChild: ChildNode;

      if (remainingPath.length === 0) {
        updatedChild = replacement;
      } else {
        if (!treeNode.isTreeNodeBranch(child)) {
          return undefined;
        }

        if (child.branches === null) {
          return undefined;
        }

        const updatedBranches = treeNode.setAtPath(
          child.branches,
          remainingPath,
          replacement,
        );

        if (updatedBranches === undefined) {
          return undefined;
        }

        // The intersection preserves ChildNode's additional properties,
        // while the updated branches preserve the recursive tree shape.
        updatedChild = {
          ...child,
          branches: updatedBranches,
        } as ChildNode;
      }

      const updatedEntries = [...entries];
      updatedEntries[childIndex] = updatedChild;

      return updatedEntries;
    },

    setBranchesAtPath(entries, path, newBranches) {
      if (path.length === 0) {
        return undefined;
      }

      const node = treeNode.getAtPath(entries, path);

      if (node === undefined || !treeNode.isTreeNodeBranch(node)) {
        return undefined;
      }

      return treeNode.setAtPath(entries, path, {
        ...node,
        branches: newBranches,
      } as ChildNode);
    },
  };

  return treeNode;
}
