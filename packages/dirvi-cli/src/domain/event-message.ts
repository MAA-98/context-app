import { UnixEntryPath, State } from 'dirvi-lib';

export type EventMessage =
  | {
      type: 'view';
      view: State;
    }
  | {
      type: 'displayed-files-paths';
      paths: string[];
    }
  | {
      type: 'file';
      path: UnixEntryPath;
    };
