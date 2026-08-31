import { getCwdAbsPath } from 'directory-app/dist/infrastructure/get-cwd.js';
import { getDirLazyEntries } from 'directory-app/dist/infrastructure/get-dir-lazy-entries.js';
import { createEmptyFoldNode } from 'directory-app/dist/application/fold/create-fold-node.js';
import { toDisplayEntry } from 'directory-app/dist/domain/view.js';
export async function loadInitialProps() {
    const cwdAddress = getCwdAbsPath();
    const lazyEntries = await getDirLazyEntries(cwdAddress);
    if (lazyEntries.length === 0) {
        return {
            cwdAddress,
            initialView: {
                cursor: undefined,
            },
        };
    }
    const firstEntry = lazyEntries[0];
    if (firstEntry === undefined) {
        throw new Error('Expected a first entry after checking that the directory is non-empty');
    }
    return {
        cwdAddress,
        initialView: {
            buffer: {
                entries: lazyEntries,
            },
            cursor: {
                kind: 'entry',
                parentPath: [],
                entry: toDisplayEntry(firstEntry),
            },
            folds: createEmptyFoldNode(),
        },
    };
}
