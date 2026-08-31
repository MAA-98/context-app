import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from 'ink';
import { App } from './App.js';
export function AppShell({ cwdAddress, initialView, onViewChange, onError }) {
    if (initialView.cursor === undefined) {
        return _jsx(Text, { dimColor: true, children: "Directory is empty." });
    }
    return (_jsx(App, { cwdAddress: cwdAddress, initialView: initialView, onViewChange: onViewChange, onError: onError }));
}
