# droid-plugins

Personal [Factory Droid](https://docs.factory.com/harness/plugins) plugin marketplace.

## Install

```
droid plugin marketplace add marcusyoung/droid-plugins
droid plugin install handoff@droid-plugins --scope user
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

## Licence

MIT
