#!/usr/bin/env node
// Stop: after a substantial turn, ask the agent once to save or correct
// durable facts. Throttled per session; never fires on a hook-continued turn.
import fs from "node:fs";
import path from "node:path";
import { readStdin, loadConfig, projectInfo, resolveSpace, STATE_DIR } from "./lib.mjs";

const input = readStdin();
const config = loadConfig();
const nudge = config.stopNudge;

if (!nudge.enabled || input.stop_hook_active || !input.session_id) process.exit(0);
if (Number(input.tool_execution_count || 0) < Number(nudge.minToolCalls || 0)) process.exit(0);

const stateFile = path.join(STATE_DIR, `${String(input.session_id).replace(/[^\w-]/g, "")}.last`);
let last = 0;
try { last = Number(fs.readFileSync(stateFile, "utf8")) || 0; } catch { /* first nudge */ }
const now = Date.now();
if (now - last < Number(nudge.minIntervalMinutes || 0) * 60_000) process.exit(0);

fs.mkdirSync(STATE_DIR, { recursive: true });
fs.writeFileSync(stateFile, String(now));

const info = projectInfo(input.cwd || process.cwd());
const project = info.name;
const { space } = resolveSpace(config, info);

process.stdout.write(JSON.stringify({
  decision: "block",
  reason:
    `Memory check (connapse-memory): if this turn established a durable fact for "${project}" ` +
    `(decision with rationale, configuration value, path, install step, root cause), save it with ` +
    `memory_remember to space "${space}" (personal preferences go to "${config.personalSpace}"), or use ` +
    `memory_correct if a recalled fact changed. Cite source document IDs where you have them. ` +
    `If nothing qualifies, end the turn without any further message.`,
}));
process.exit(0);
