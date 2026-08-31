import { FoldNode } from '../../domain/view.js';

export function createEmptyFoldNode(): FoldNode {
  return {
    children: Object.create(null) as Record<string, FoldNode>,
    folds: [],
  };
}
