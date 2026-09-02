#!/usr/bin/env zsh
#
# formatted-file
#
# Read one regular file and write it to stdout as a Markdown fenced code
# block. The file's absolute path is used as the code fence's info string.
#
# Usage:
#   formatted-file FILE
#   formatted-file --help
#
# Arguments:
#   FILE      Path to the regular file to format. Relative paths are resolved
#             to absolute paths in the generated code fence.
#
# Options:
#   --help    Display this help text and exit successfully.
#   --        Stop option parsing; useful when FILE begins with a hyphen.
#
# Output:
#   The generated Markdown is written to standard output.
#
# Errors:
#   The script exits with a nonzero status if FILE is missing, if more than
#   one positional argument is supplied, if an unknown option is used, or if
#   FILE does not refer to a regular file.

set -eu

usage() {
  cat <<'EOF'
Usage: formatted-file FILE

Options:
  --help    show this help
EOF
}

while (( $# > 0 )); do
  case "$1" in
    --help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
  shift
done

if (( $# != 1 )); then
  echo "Usage: formatted-file FILE" >&2
  exit 1
fi

INPUT_FILE="$1"

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Error: not a regular file: $INPUT_FILE" >&2
  exit 1
fi

FILE_PATH="${INPUT_FILE:A}"

{
  printf '```%s\n' "$FILE_PATH"
  cat -- "$FILE_PATH"
  printf '\n```\n'
}