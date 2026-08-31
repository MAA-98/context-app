import { createEmptyFoldNode } from 'directory-app';
export function hasFold(node, entryName) {
    return node.folds.includes(entryName);
}
export function entryIsFolded(node, entry) {
    return node !== undefined && hasFold(node, entry.name);
}
export function updateFoldNodeAtPath(node, path, update) {
    const [currentName, ...remainingPath] = path;
    // Base case
    if (currentName === undefined) {
        return update(node);
    }
    // Create childNode to create path in tree to the needed node
    const childNode = node.children[currentName] ?? createEmptyFoldNode();
    return {
        ...node,
        children: {
            ...node.children,
            [currentName]: updateFoldNodeAtPath(childNode, remainingPath, update),
        },
    };
}
// Replaces all folds at a node
export function setFolds(node, entries) {
    const entryNames = entries.map((entry) => entry.name);
    return {
        ...node,
        folds: entryNames,
    };
}
export function addFold(node, entryName) {
    if (hasFold(node, entryName)) {
        return node;
    }
    return {
        ...node,
        folds: [...node.folds, entryName],
    };
}
export function unfoldFoldSequence(node, entries, entryName) {
    const entryIndex = entries.findIndex((entry) => entry.name === entryName);
    if (entryIndex === -1 || !hasFold(node, entryName)) {
        return node;
    }
    let firstIndex = entryIndex;
    while (firstIndex > 0 && hasFold(node, entries[firstIndex - 1].name)) {
        firstIndex -= 1;
    }
    let lastIndex = entryIndex;
    while (lastIndex < entries.length - 1 &&
        hasFold(node, entries[lastIndex + 1].name)) {
        lastIndex += 1;
    }
    const unfoldedNames = new Set(entries.slice(firstIndex, lastIndex + 1).map((entry) => entry.name));
    return {
        ...node,
        folds: node.folds.filter((foldedName) => !unfoldedNames.has(foldedName)),
    };
}
