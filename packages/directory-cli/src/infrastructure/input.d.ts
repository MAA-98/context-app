import type { Key } from 'ink';
import type { Action } from '../application/reducer.js';
import type { View } from 'directory-app';
export type PendingInput = 'z';
export type InputResult = Action | PendingInput | undefined;
export declare function inputToInputResult(input: string, key: Key, view: View, pendingInput?: PendingInput): InputResult;
//# sourceMappingURL=input.d.ts.map