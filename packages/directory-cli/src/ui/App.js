import { jsx as _jsx } from "react/jsx-runtime";
import { join } from 'node:path';
import { Box, Text, useApp, useInput } from 'ink';
import { useEffect, useReducer, useRef, useState } from 'react';
import { getDirLazyEntries } from 'directory-app';
import { reducer } from '../application/reducer.js';
import { inputToInputResult } from '../infrastructure/input.js';
import DirEntries from './components/DirEntries.js';
import { createDisplayRows } from '../application/display-rows.js';
export function App({ cwdAddress, initialView, onViewChange, onError }) {
    const [view, dispatch] = useReducer(reducer, initialView);
    const [exitStatus, setExitStatus] = useState();
    const pendingInput = useRef(undefined);
    const { buffer, folds, cursor } = view;
    useEffect(() => {
        onViewChange?.(view);
    }, [view, onViewChange]);
    // --- Input ---
    useInput((input, key) => {
        const result = inputToInputResult(input, key, view, pendingInput.current);
        if (result === 'z') {
            pendingInput.current = result;
            return;
        }
        pendingInput.current = undefined;
        if (result === undefined) {
            return;
        }
        const action = result;
        if (action.kind === 'expandDir') {
            const address = join(cwdAddress, ...action.path);
            void getDirLazyEntries(address)
                .then((entries) => {
                dispatch({
                    kind: 'directoryLoaded',
                    path: action.path,
                    entries,
                });
            })
                .catch((error) => {
                const appError = error instanceof Error ? error : new Error(String(error));
                onError?.(appError);
                setExitStatus(`Unable to open directory: ${appError.message}`);
            });
            return;
        }
        if (action.kind === 'exit') {
            setExitStatus(action.exitMessage);
        }
        dispatch(action);
    });
    // --- Exit Logic ---
    const { exit } = useApp();
    useEffect(() => {
        if (exitStatus === undefined) {
            return;
        }
        if (exitStatus !== '') {
            onError?.(new Error(exitStatus));
        }
        exit();
    }, [exitStatus, exit, onError]);
    if (exitStatus !== undefined) {
        return null;
    }
    // --- JSX ---
    const displayRows = createDisplayRows(buffer, folds);
    return (_jsx(Box, { flexDirection: "column", children: (buffer.entries.length === 0 || cursor === undefined) ? (_jsx(Text, { dimColor: true, children: "Directory is empty." })) : (_jsx(DirEntries, { rows: displayRows, cursor: cursor })) }));
}
