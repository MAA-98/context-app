import { EntryPath, View } from 'directory-app';

export type PrintMessage =
  | {
      type: 'view';
      view: View;
    }
  | {
      type: 'file';
      path: EntryPath;
    };
