#!/usr/bin/env zsh

set -eu
setopt pipefail

usage() {
  cat <<'EOF'
Usage: formatted-context-files [CONTEXT_FILE]

Read absolute file paths from context.json and write each file as a
Markdown fenced code block.

Arguments:
  CONTEXT_FILE  JSON file containing an array of absolute file paths.
                Defaults to ./context.json.
EOF
}

if (( $# > 1 )); then
  usage >&2
  exit 1
fi

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

# Directory containing this script, not the current working directory.
SCRIPT_DIR="${0:A:h}"
FORMATTER="$SCRIPT_DIR/formatted-file.zsh"

if [[ ! -f "$FORMATTER" ]]; then
  echo "Error: formatter script not found: $FORMATTER" >&2
  exit 1
fi

CONTEXT_FILE="${1:-$PWD/context.json}"

if [[ ! -f "$CONTEXT_FILE" ]]; then
  echo "Error: context file not found: $CONTEXT_FILE" >&2
  exit 1
fi

if ! jq -e '
  type == "array" and
  all(.[]; type == "string" and startswith("/"))
' "$CONTEXT_FILE" >/dev/null; then
  echo "Error: expected $CONTEXT_FILE to contain an array of absolute paths" >&2
  exit 1
fi

jq -r '.[]' "$CONTEXT_FILE" |
while IFS= read -r ABSOLUTE_PATH; do
  if [[ ! -f "$ABSOLUTE_PATH" ]]; then
    echo "Error: not a regular file: $ABSOLUTE_PATH" >&2
    exit 1
  fi

  zsh "$FORMATTER" -- "$ABSOLUTE_PATH"
  printf '\n'
done