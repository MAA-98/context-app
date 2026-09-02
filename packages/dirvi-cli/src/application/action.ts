import { UnixEntry, UnixEntryPath } from 'dirvi-lib';

export type Action =
  | {
      kind: 'nextEntry';
    }
  | {
      kind: 'prevEntry';
    }
  | {
      kind: 'updateDir';
      path: UnixEntryPath;
      entries: UnixEntry[] | undefined;
    }
  | {
      kind: 'printFile';
      path: UnixEntryPath;
    }
  | {
      kind: 'outDir';
    }
  | {
      kind: 'toggleFold';
    }
  | {
      kind: 'fold';
    }
  | {
      kind: 'unfold';
    }
  | {
      kind: 'exit';
      exitMessage: string;
    };