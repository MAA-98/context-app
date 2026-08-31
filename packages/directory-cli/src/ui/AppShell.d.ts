import { UnixAbsolutePath, View } from 'directory-app';
export type EmptyView = {
    cursor: undefined;
};
export type ShellAppProps = {
    cwdAddress: UnixAbsolutePath;
    initialView: View | EmptyView;
    onViewChange?: (view: View) => void;
    onError?: (error: Error) => void;
};
export declare function AppShell({ cwdAddress, initialView, onViewChange, onError }: ShellAppProps): import("react").JSX.Element;
//# sourceMappingURL=AppShell.d.ts.map