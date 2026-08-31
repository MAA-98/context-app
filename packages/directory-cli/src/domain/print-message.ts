import { View } from 'directory-app';

export type PrintMessage =
  | {
      type: 'view';
      view: View;
    }
  | {
      type: 'filepath';
      path: string;
    };
