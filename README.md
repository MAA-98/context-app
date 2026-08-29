# repo-intents

`repo-intents` is a CLI for organizing common repository actions by intent.
It provides a consistent format to list, search, and execute reusable shell actions.
Provides automatic prompt builder, so command options or script arguments never have to be memorized.

### Motivation

`repo-intents` exists to reduce the friction of remembering and rediscovering common terminal tasks. 
Instead of hunting through your scripts or asking LLM agents, you search for an intent within the terminal and run the corresponding action.

This combines the benefit of easy finding and deterministic runs.

## Concepts 

- Intent: An aim of *actions*.
- Action: a specific and deterministic thing done.
- Steps: granular description of actions.

`intent -> actions -> steps`

The design of `repo-intents` is to abstract actions and steps to *intents*.
Then details of how to do an action are not needed in daily work on a repository, or generally in the shell.
A script can be said to do the same thing except it abstracts actions to a filename, rather than an intent.

### Example

Using the `add` command goes through interactive steps to create an intent, if you have initialized a `.repo-intents` workspace in the current directory path.

Our first intent:
```txt
{
  "schemaVersion": 1,
  "shortDesc": "Updating local changes everywhere.",
  "longDesc": "Updating all local changes in the git repository and pushing them to remote.",
  "actions": [
    {
      "desc": "",
      "step": {
        "prompts": [
          {
            "varName": "commit_msg",
            "prompt": "Commit message?"
          }
        ],
        "command": "git add -A && git commit -m \"$commit_msg\" && git push"
      }
    }
  ]
}
```

It has a single prompt for a commit message, which is then inserted in the shell command using standard environment variable syntax.

WARNING: In the `add` interactive editor, do not write `\"` for quoting in the command, just write `"`.

An intent can have multiple actions, and an action can have multiple prompts but only one command.

## CLI usage
The current command arguments:

- `rein init`
- `rein init --global`
- `rein add`
- `rein edit <intent-id>`
- `rein run <intent-id>`
- `rein search`

### Warning

Only use intents you trust. `repo-intents` executes shell commands directly.

## Try it locally

Until the package is published, you can run it from a local checkout.

```zsh
git clone <repo-url>
cd repo-intents
npm install
npm run build
npm link
rein --help
```

After linking, the CLI is available as `rein`.

## Implementation

### Files

Initializing with `init` in a repository creates a new hidden subdirectory in the current working directory of this shape:

```text
.repo-intents/
  intents/
```

The command `init --global` does the same in the home directory. 
Note that intents are always searched through the whole parent path, with closer to the current working directory prioritized.
Therefore, global intents can be saved when not specific to a repository, and subdirectories can have their own intents that are discoverable from any path contained within it.

In the code, each such directory with a `.repo-intents/` folder is called a `Workspace`. 

Intents are saved at the repo-level when added like so:

```text
.repo-intents/
  intents/
    {some-intent-id}/
      intent.json
```

### Software Architecture

Follows onion/DDD-style principles of dependency inversion layers. 
Loosely, `src/` has dependency hierarchy (higher cannot depend on lower): 

```txt
domain
  types
  contracts
application
  types
  contracts
ui
infrastructure
```

The composition root is in `index.ts`: it wires infrastructure implementations to application/domain contracts and registers CLI commands.

## Design Principles for 1.x

Keeping it simple:
- steps are either prompts for arguments or shell commands
- an action is a sequence of prompts followed by a shell command
- output of an action can't be used by the next action; there's no long-running environment over actions. 
This means if you want to use the output from one command in another you need to write it as one action step, i.e. *actions are not functions*, they don't return data.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## TODOs:

- Improved search algorithm and `search` UI
- Support for adding multiple actions in `add`