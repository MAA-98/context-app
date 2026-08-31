import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text } from 'ink';
export function UnixEntry({ entry, selected }) {
    switch (entry.kind) {
        case 'file':
            return (_jsx(Text, { inverse: selected, children: entry.name }));
        case 'symlink':
            return (_jsxs(Text, { inverse: selected, children: [entry.name, " -> ", entry.target] }));
        case 'directory':
            return (_jsxs(Text, { inverse: selected, color: "blue", children: [entry.name, "/"] }));
    }
}
