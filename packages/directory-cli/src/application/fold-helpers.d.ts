import type { UnixEntry, UnixEntryName, FoldNode } from 'directory-app';
export declare function hasFold(node: FoldNode, entryName: UnixEntryName): boolean;
export declare function entryIsFolded(node: FoldNode | undefined, entry: UnixEntry): boolean;
export declare function updateFoldNodeAtPath(node: FoldNode, path: UnixEntryName[], update: (node: FoldNode) => FoldNode): FoldNode;
export declare function setFolds(node: FoldNode, entries: UnixEntry[]): FoldNode;
export declare function addFold(node: FoldNode, entryName: UnixEntryName): FoldNode;
export declare function unfoldFoldSequence(node: FoldNode, entries: UnixEntry[], entryName: UnixEntryName): FoldNode;
//# sourceMappingURL=fold-helpers.d.ts.map