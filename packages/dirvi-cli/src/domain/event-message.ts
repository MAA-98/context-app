import { PosixName, PosixState, State } from 'dirvi-lib';

export type EventMessage =
  | {
      type: 'view';
      view: PosixState;
    }
  | {
      type: 'displayed-files-paths';
      paths: string[];
    }
  | {
      type: 'file';
      path: PosixName[];
    };
