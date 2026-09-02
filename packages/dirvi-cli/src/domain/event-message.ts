import { UnixEntryPath, View } from 'dirvi-lib';

export type EventMessage =
  | {
      type: 'view';
      view: View;
    }
  | {
      type: 'displayed-files-paths';
      paths: string[];
    }
  | {
      type: 'file';
      path: UnixEntryPath;
    };
