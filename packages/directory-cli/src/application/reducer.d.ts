import { UnixEntry, UnixEntryName, EntryPath, View } from 'directory-app';
export type Action = {
    kind: 'expandDir';
    path: EntryPath;
} | {
    kind: 'directoryLoaded';
    path: UnixEntryName[];
    entries: UnixEntry[];
} | {
    kind: 'nextEntry';
} | {
    kind: 'prevEntry';
} | {
    kind: 'outDir';
} | {
    kind: 'toggleFold';
} | {
    kind: 'fold';
} | {
    kind: 'unfold';
} | {
    kind: 'exit';
    exitMessage: string;
};
export declare function reducer(view: View, action: Action): View;
//# sourceMappingURL=reducer.d.ts.map