# dirvi

A terminal UI for browsing directories as an expandable tree.

`dirvi` does not change the tree root while navigating. Directories are opened and closed in place, and the cursor moves through the currently visible entries.

## Installation

Install `dirvi` globally with npm:

```sh
npm install --global @mak-98/dirvi-cli
```

## Usage

Launch `dirvi` from the directory you want to browse:

```sh
dirvi
```

## Controls

| Key         | Action                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `j` / Down  | Move to the next visible entry                                           |
| `k` / Up    | Move to the previous visible entry                                       |
| `h` / Left  | Move to the parent directory                                             |
| `l` / Right | Open or close a directory; send a file path when the cursor is on a file |

## Open/Close Directory

Opening and closing affect the materialized tree ([`DirectoryBuffer`](packages/dirvi-lib/src/domain/view.ts)) in the TUI:

- Opening a directory creates its child entries in the buffer.
- Closing a directory removes its descendants from the buffer.
- Closing recursively closes descendant directories as well.
- Opening a directory does not automatically open its child directories.

WARNING: Folding is a separate mechanism. It controls the visibility of entries while preserving their directory open/closed state.

### Opening directories

When the cursor is on a closed directory, press `l` or Right to open it:

```text
▸ src/
```

becomes:

```text
▾ src/
  main.ts
  util.ts
```

The cursor remains on `src/`. Press Down to move into its children.

When the cursor is on an already-open directory, press `l` or Right to close it.

### Closing directories

Closing a directory removes its descendants from the visible tree:

```text
▾ project/
  ▾ src/
    ▾ components/
      Button.tsx
```

becomes:

```text
▸ project/
```

Closing a directory also closes all descendant directories. Reopening it reveals its immediate children, but does not automatically reopen the entire subtree.

## Navigation

Navigation is based on visible entries only:

- Down moves to the next entry currently shown in the tree.
- Up moves to the previous entry currently shown.
- A closed directory has no visible children.
- Files and symlinks have no children.
- Right opens a closed directory but does not move into it.
- Down is used to enter an opened directory.
- Left always moves toward the parent.

### Moving to parents

`h` or Left always moves the cursor to the parent directory. It does not close the current directory.

For example:

```text
▾ project/
  ▾ src/
    main.ts
```

With the cursor on `main.ts`, pressing Left moves to `src/`. Pressing it again moves to `project/`.

If the cursor is on an open or closed directory, Left still moves toward its parent without changing its open/close state.

## Piping and output

`dirvi` can be connected to another process through stdout.

When the view changes, `dirvi` sends the current view, including:

- The directory buffer
- Folds
- The current cursor

When the cursor is on a file and `l` or Right is pressed, `dirvi` sends that file's [`EntryPath`](packages/dirvi-lib/src/domain/display-row.ts).

The output messages are type [PrintMessage](packages/dirvi-cli/src/domain/print-message.ts):

```ts
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
```

A consumer can use it as they please by piping, here:

```sh
dirvi | jq --unbuffered -c '.' > dirvi-output.json
```

`--unbuffered` makes `jq` flush each message immediately, so the `dirvi-output.json` contains the last message produced by dirvi.

Use `view` messages to make view-aware actions, `file` messages to process the selected file.

## Licensing

- The terminal application (`packages/dirvi-cli`) is licensed under the GPLv3.
- The internal library (`packages/dirvi-lib`) is licensed under the LGPLv3.
