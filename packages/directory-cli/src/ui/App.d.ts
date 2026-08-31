import { UnixAbsolutePath, View } from 'directory-app';
export type AppProps = {
    cwdAddress: UnixAbsolutePath;
    initialView: View;
    onViewChange?: (view: View) => void;
    onError?: (error: Error) => void;
};
export declare function App({ cwdAddress, initialView, onViewChange, onError }: AppProps): import("react").JSX.Element | null;
//# sourceMappingURL=App.d.ts.map