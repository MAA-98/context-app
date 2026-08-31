import { UnixAbsolutePath } from '../domain/unix-entry.js';
import { View } from '../domain/view.js';

export type AppProps = {
  rootAddress: UnixAbsolutePath;
  initialView: View;
};
