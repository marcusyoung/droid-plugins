#!/usr/bin/env node
// Stop hook: once context reaches the threshold, block the stop and tell Droid
// to ask whether to hand off. Re-arms after context drops below the threshold
// (e.g. after compaction).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const THRESHOLD = Number(process.env.HANDOFF_PROMPT_TOKENS) || 200000;
const STATE_DIR = path.join(os.homedir(), ".factory", "state", "handoff-prompt");

function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

function contextTokens(transcriptPath) {
  // Droid keeps per-session usage next to the transcript; lastCallTokenUsage is
  // the prompt size of the most recent model call, i.e. the current context.
  const settingsPath = transcriptPath.replace(/\.jsonl$/i, ".settings.json");
  const s = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  const u = s.lastCallTokenUsage || {};
  return (u.inputTokens || 0) + (u.cacheReadTokens || 0) + (u.cacheCreationTokens || 0);
}

const input = readStdin();
if (input.stop_hook_active || !input.transcript_path || !input.session_id) process.exit(0);

let tokens;
try { tokens = contextTokens(input.transcript_path); } catch { process.exit(0); }

const flag = path.join(STATE_DIR, `${input.session_id.replace(/[^\w-]/g, "")}.prompted`);

if (tokens < THRESHOLD) {
  fs.rmSync(flag, { force: true });
  process.exit(0);
}
if (fs.existsSync(flag)) process.exit(0);

fs.mkdirSync(STATE_DIR, { recursive: true });
fs.writeFileSync(flag, String(tokens));

const k = Math.round(tokens / 1000);
process.stdout.write(JSON.stringify({
  decision: "block",
  reason:
    `Context is ~${k}k tokens (handoff threshold ${Math.round(THRESHOLD / 1000)}k). ` +
    `Before ending the turn, use AskUser to ask: "Context is ~${k}k. Do you want to hand off now?" ` +
    `with options "Hand off now" and "Not now". If the user chooses to hand off, follow ` +
    `the /handoff-save command: load the session-continuity skill and run its ` +
    `"Workflow: Creating a Handoff". If not, end the turn without further work.`,
}));
process.exit(0);
