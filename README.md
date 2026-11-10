# droid-plugins

Personal [Factory Droid](https://docs.factory.com/harness/plugins) plugin marketplace.

## Install

```
droid plugin marketplace add marcusyoung/droid-plugins
droid plugin install handoff@droid-plugins --scope user
droid plugin install connapse-memory@droid-plugins --scope user
```

Restart Droid afterwards. Enable or disable plugins with `/plugins`.

## Plugins

### handoff

- `/handoff-save [topic-slug]` creates a session handoff document.
- `/handoff-resume [handoff-id]` resumes one.
- `session-continuity` skill: the handoff schema and workflows. Requires the `project-knowledge` MCP server (Connapse).
- Stop hook: when the provider-reported context of the last model call reaches 200k tokens, Droid asks "Context is ~Nk. Do you want to hand off now?" It asks once per session and re-arms after context drops below the threshold. Override the threshold with the `HANDOFF_PROMPT_TOKENS` environment variable.

The hook reads `lastCallTokenUsage` (`inputTokens + cacheReadTokens + cacheCreationTokens`) from the session's `.settings.json`. This is the same measure Droid's auto-compaction uses, and it reads higher than the context display, which leaves out the system prompt and tool definitions.

Requires Node.js on `PATH`.

### connapse-memory

Connapse agent memory for Droid. Requires the `project-knowledge` MCP server (Connapse) for the `memory_*` tools, and optionally the [`connapse` CLI](https://github.com/Destrayon/connapse-cli), signed in with `connapse auth login`, so the hooks can read facts and create spaces. The `memory` commands are on the CLI's `main` branch and not yet in a release (v0.5.1); build from source until they are.

- Spaces: each git repository uses its own `<repository>-memory` team space (worktrees use the main checkout's name). Outside a git repository, the hooks use `defaultSpace`. With `createSpaces`, SessionStart creates a missing repository space.
- SessionStart hook: injects the space, the save/recall rules and up to `injectFacts` current facts (newest first, at most 100). Values over 300 characters are truncated with a hint to recall the full fact. If the CLI is missing or signed out, it injects the rules only.
- UserPromptSubmit hook: on the first prompt of a session, searches the repository space and `personalSpace` for facts sharing words with the prompt and injects up to `promptRecall.limit` per space, skipping facts already injected. CLI calls stop after `promptRecall.budgetMs`, keeping the hook within its 20-second timeout. Silent when nothing matches.
- `connapse-memory` skill: moving, correcting and deleting facts (including the approval flow), searching another repository's space, naming conventions and CLI troubleshooting.
- Stop hook (off by default): after a turn with at least `minToolCalls` tool calls, at most once every `minIntervalMinutes` per session, asks the agent to save or correct durable facts or end the turn silently. Each nudge costs one extra model turn. It never fires on a turn the hook itself continued.

Configuration lives in `~/.factory/connapse-memory.json` (override with `CONNAPSE_MEMORY_CONFIG`); all keys are optional:

```json
{
  "spaceSuffix": "-memory",
  "createSpaces": true,
  "defaultSpace": "team-memory",
  "personalSpace": "my-memory",
  "injectFacts": 20,
  "promptRecall": { "enabled": true, "limit": 8, "maxKeywords": 12, "budgetMs": 15000 },
  "stopNudge": { "enabled": false, "minToolCalls": 3, "minIntervalMinutes": 15 }
}
```

## Licence

MIT
