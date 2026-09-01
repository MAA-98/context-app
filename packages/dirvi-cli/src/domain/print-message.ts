import { EntryPath, View } from 'dirvi-lib';

export type PrintMessage =
  | {
      type: 'view';
      view: View;
    }
  | {
      type: 'file';
      path: EntryPath;
    };
