# connapse-memory tests

Regression tests for the connapse-memory hooks. They use Node's built-in test runner, so there is nothing to install.

## Requirements

- Node.js 21 or later (for glob patterns in `node --test`)
- Git on `PATH`

## Running

From the repository root:

```
node --test "tests/connapse-memory/*.test.mjs"
```

To run the tests for every plugin:

```
node --test "tests/**/*.test.mjs"
```

Keep the quotes so Node expands the glob, not the shell. On Node 24, `node --test tests/` fails because Node tries to load the folder as a module.

## What the tests do

- They run the real hook scripts as child processes, using a temporary home folder and config file, so they don't touch your `~/.factory` state.
- `mock-connapse.mjs` is preloaded with `--import` and stands in for the `connapse` CLI. No real server is contacted and no spaces or facts are created.
- Git fixtures (normal repositories, linked worktrees and `--separate-git-dir` checkouts) are created in the system temp folder.

## Testing another checkout

Set `CM_REPO_ROOT` to run the tests against a different copy of the repository, for example an older commit extracted with `git archive`:

```
$env:CM_REPO_ROOT = "C:\path\to\other\checkout"
node --test "tests/connapse-memory/*.test.mjs"
```
