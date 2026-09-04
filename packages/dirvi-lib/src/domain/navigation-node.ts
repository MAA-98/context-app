import { UnixEntry, PosixName, UnixEntryPath } from './unix-entry.js';
import { UnixPath } from './unix-path.js';
import { FoldNode } from './fold-node.js';
import { Cursor } from './cursor.js';

export type NavigationEntry =
  | {
      kind: 'file';
      name: PosixName;
    }
  | {
      kind: 'symlink';
      name: PosixName;
      target: UnixPath;
    }
  | {
      /**
       * Undefined node means the directory has not been loaded.
       */
      kind: 'directory';
      name: PosixName;
      node?: NavigationNode;
    };

/**
 * A directory as navigated: list of visible entries and folded entries.
 */
export type NavigationNode = {
  /**
   * Currently visible entries.
   */
  entries: NavigationEntry[];

  /**
   * Currently loaded entries hidden by this directory's fold.
   */
  foldedEntries: NavigationEntry[];
};

export const NavigationNode = {
  from(
    entries: UnixEntry[] | undefined,
    foldNode: FoldNode | undefined,
  ): NavigationNode {
    if (entries === undefined) {
      return {
        entries: [],
        foldedEntries: [],
      };
    }

    const foldedNames = new Set(foldNode?.folds ?? []);
    const visibleEntries: NavigationEntry[] = [];
    const foldedEntries: NavigationEntry[] = [];

    for (const entry of entries) {
      let navigationEntry: NavigationEntry;

      switch (entry.kind) {
        case 'file':
          navigationEntry = {
            kind: 'file',
            name: entry.name,
          };
          break;

        case 'symlink':
          navigationEntry = {
            kind: 'symlink',
            name: entry.name,
            target: entry.target,
          };
          break;

        case 'directory': {
          const childFoldNode = foldNode?.children[entry.name];

          navigationEntry = {
            kind: 'directory',
            name: entry.name,
            node:
              entry.entries === undefined
                ? undefined
                : NavigationNode.from(entry.entries, childFoldNode),
          };
          break;
        }
      }

      if (foldedNames.has(entry.name)) {
        foldedEntries.push(navigationEntry);
      } else {
        visibleEntries.push(navigationEntry);
      }
    }

    return {
      entries: visibleEntries,
      foldedEntries,
    };
  },

  getNodeAtPath(
    navigation: NavigationNode,
    path: UnixEntryPath,
  ): NavigationNode | undefined {
    const [currentName, ...remainingPath] = path;

    // An empty path identifies the current node.
    if (currentName === undefined) {
      return navigation;
    }

    const entry = [...navigation.entries, ...navigation.foldedEntries].find(
      (candidate) => candidate.name === currentName,
    );

    if (entry === undefined || entry.kind !== 'directory') {
      return undefined;
    }

    // The directory has not been loaded/opened.
    if (entry.node === undefined) {
      return undefined;
    }

    return NavigationNode.getNodeAtPath(entry.node, remainingPath);
  },

  getEntryAtPath(
    navigation: NavigationNode,
    path: UnixEntryPath,
  ): NavigationEntry | undefined {
    const [currentName, ...remainingPath] = path;

    if (currentName === undefined) {
      return undefined;
    }

    const entry = [...navigation.entries, ...navigation.foldedEntries].find(
      (candidate) => candidate.name === currentName,
    );

    if (entry === undefined) {
      return undefined;
    }

    if (remainingPath.length === 0) {
      return entry;
    }

    if (entry.kind !== 'directory' || entry.node === undefined) {
      return undefined;
    }

    return NavigationNode.getEntryAtPath(entry.node, remainingPath);
  },

  nextCursor(rootNode: NavigationNode, cursor: Cursor): Cursor | undefined {
    const cursors = cursorsInNode(rootNode, []);

    const currentIndex = cursors.findIndex((candidate) =>
      Cursor.equal(candidate, cursor),
    );

    if (currentIndex === -1 || currentIndex === cursors.length - 1) {
      return undefined;
    }

    return cursors[currentIndex + 1];
  },

  previousCursor(rootNode: NavigationNode, cursor: Cursor): Cursor | undefined {
    const cursors = cursorsInNode(rootNode, []);

    const currentIndex = cursors.findIndex((candidate) =>
      Cursor.equal(candidate, cursor),
    );

    if (currentIndex <= 0) {
      return undefined;
    }

    return cursors[currentIndex - 1];
  },

  cursorAfterFold(
    rootNode: NavigationNode,
    cursor: Cursor,
  ): Cursor | undefined {
    if (cursor.kind === 'fold') {
      return undefined;
    }

    const cursors = cursorsInNode(rootNode, []);

    const currentIndex = cursors.findIndex((candidate) =>
      Cursor.equal(candidate, cursor),
    );

    if (currentIndex === -1) {
      return undefined;
    }

    const foldedPath = [...cursor.parentPath, cursor.entryName];

    for (let index = currentIndex + 1; index < cursors.length; index += 1) {
      const candidate = cursors[index];

      if (candidate === undefined) {
        continue;
      }

      if (cursorBelongsToSubtree(candidate, foldedPath)) {
        continue;
      }

      return candidate;
    }

    // The fold row will be created at the end of this directory.
    return {
      kind: 'fold',
      parentPath: cursor.parentPath,
    };
  },

  parentCursor(navigation: NavigationNode, cursor: Cursor): Cursor | undefined {
    const parentPath = cursor.parentPath;

    // The cursor is already in the root directory.
    if (parentPath.length === 0) {
      return undefined;
    }

    const entryName = parentPath.at(-1);

    if (entryName === undefined) {
      return undefined;
    }

    const containingPath = parentPath.slice(0, -1);
    const entry = NavigationNode.getEntryAtPath(navigation, parentPath);

    if (entry === undefined || entry.kind !== 'directory') {
      return undefined;
    }

    return {
      kind: 'entry',
      parentPath: containingPath,
      entryName,
    };
  },

  visibleFilesPaths(
    navigation: NavigationNode,
    parentPath: UnixEntryPath = [],
  ): UnixEntryPath[] {
    const paths: UnixEntryPath[] = [];

    for (const entry of navigation.entries) {
      const entryPath = [...parentPath, entry.name];

      switch (entry.kind) {
        case 'file':
          paths.push(entryPath);
          break;

        case 'symlink':
          // Do not recurse through symlinks.
          break;

        case 'directory':
          if (entry.node !== undefined) {
            paths.push(
              ...NavigationNode.visibleFilesPaths(entry.node, entryPath),
            );
          }
          break;
      }
    }

    return paths;
  },
};

function cursorsInNode(
  node: NavigationNode,
  parentPath: UnixEntryPath,
): Cursor[] {
  const cursors: Cursor[] = [];

  for (const entry of node.entries) {
    cursors.push({
      kind: 'entry',
      parentPath,
      entryName: entry.name,
    });

    if (entry.kind !== 'directory' || entry.node === undefined) {
      continue;
    }

    cursors.push(...cursorsInNode(entry.node, [...parentPath, entry.name]));
  }

  if (node.foldedEntries.length > 0) {
    cursors.push({
      kind: 'fold',
      parentPath,
    });
  }

  return cursors;
}

function cursorBelongsToSubtree(
  cursor: Cursor,
  entryPath: UnixEntryPath,
): boolean {
  if (cursor.kind === 'fold') {
    return UnixEntryPath.isStrictPathPrefix(entryPath, cursor.parentPath);
  }

  const cursorPath = [...cursor.parentPath, cursor.entryName];

  return UnixEntryPath.isStrictPathPrefix(entryPath, cursorPath);
}
