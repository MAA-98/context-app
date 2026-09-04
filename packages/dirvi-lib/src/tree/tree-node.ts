// Assumption:
// Among branches of a node, names are unique.
type TreeNodeBase = {
  name: string;
  treeNodeKind: string;
};

export type TreeNodeLeaf = TreeNodeBase & {
  branches?: never;
};

export type TreeNodeBranch = TreeNodeBase & {
  branches: TreeNode[];
};

export type TreeNode = TreeNodeLeaf | TreeNodeBranch;
