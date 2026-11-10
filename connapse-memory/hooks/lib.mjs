// Shared helpers: config loading, repository-to-space resolution, CLI calls.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const CONFIG_PATH =
  process.env.CONNAPSE_MEMORY_CONFIG ||
  path.join(os.homedir(), ".factory", "connapse-memory.json");

export const STATE_DIR = path.join(os.homedir(), ".factory", "state", "connapse-memory");

const DEFAULTS = {
  spaceSuffix: "-memory",
  createSpaces: true,
  defaultSpace: "team-memory",
  personalSpace: "my-memory",
  injectFacts: 20,
  cliTimeoutMs: 8000,
  promptRecall: { enabled: true, limit: 8, maxKeywords: 12 },
  stopNudge: { enabled: false, minToolCalls: 3, minIntervalMinutes: 15 },
};

export function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, "utf8") || "{}"); } catch { return {}; }
}

export function loadConfig() {
  let raw = {};
  try { raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch { /* defaults */ }
  return {
    ...DEFAULTS,
    ...raw,
    promptRecall: { ...DEFAULTS.promptRecall, ...(raw.promptRecall || {}) },
    stopNudge: { ...DEFAULTS.stopNudge, ...(raw.stopNudge || {}) },
  };
}

function git(cwd, args) {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000,
  }).trim();
}

// Linked worktrees resolve to the main checkout's name, so every worktree of
// a repository maps to the same space. `repo` is false outside a git checkout.
export function projectInfo(cwd) {
  try {
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const base = path.basename(common);
    const name = base.toLowerCase() === ".git" ? path.basename(path.dirname(common)) : base.replace(/\.git$/i, "");
    return { name, repo: true };
  } catch {
    return { name: path.basename(cwd), repo: false };
  }
}

// One space per repository; outside a repository, the shared default space,
// so stray working directories never create spaces.
export function resolveSpace(config, project) {
  if (!project.repo) return { space: config.defaultSpace, perRepo: false };
  const slug = project.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug ? { space: slug + config.spaceSuffix, perRepo: true } : { space: config.defaultSpace, perRepo: false };
}

function cli(config, args) {
  try {
    const out = execFileSync("connapse", args, {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: config.cliTimeoutMs, windowsHide: true,
    });
    return { ok: true, out };
  } catch (e) {
    const detail = `${e && e.stdout ? e.stdout : ""}${e && e.stderr ? e.stderr : ""}`;
    const error = e && e.code === "ENOENT" ? "CLI not found on PATH"
      : e && e.status === 2 ? "CLI not signed in (run `connapse auth login`)"
      : e && e.signal ? "CLI timed out"
      : /not found/i.test(detail) ? "space not found"
      : "CLI call failed";
    return { ok: false, error };
  }
}

function parseFacts(out) {
  const parsed = JSON.parse(out);
  const items = Array.isArray(parsed) ? parsed : parsed.facts || [];
  // `memory list --json` wraps each fact as { fact, sources }.
  return items.map((i) => (i && i.fact) || i).filter(Boolean);
}

// Returns { ok, facts, error }. Never throws: a missing or signed-out CLI must
// not break a hook.
export function listFacts(config, space, { limit, query } = {}) {
  const args = ["memory", "list", "--space", space, "--limit", String(limit ?? config.injectFacts), "--json"];
  if (query) args.push("--query", query, "--sort", "relevance");
  const r = cli(config, args);
  if (!r.ok) return { ok: false, facts: [], error: r.error };
  try { return { ok: true, facts: parseFacts(r.out) }; } catch { return { ok: false, facts: [], error: "unreadable CLI output" }; }
}

export function createSpace(config, space, project) {
  const body = JSON.stringify({ name: space, kind: "Team", description: `Facts for the ${project} repository.` });
  return cli(config, ["api", "POST", "/api/memory/spaces", "-d", body]);
}

export function sessionStatePath(sessionId, ext) {
  const id = String(sessionId || "").replace(/[^\w-]/g, "");
  return id ? path.join(STATE_DIR, `${id}.${ext}`) : null;
}

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

export function writeJson(file, value) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value));
  } catch { /* state is best effort */ }
}

export function sanitise(s, max = 300) {
  return String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

const VALUE_MAX = 300;

export function formatFact(f) {
  const since = f.validFrom ? ` (since ${String(f.validFrom).slice(0, 10)})` : "";
  const subject = sanitise(f.subject, 80);
  const full = sanitise(f.value, Infinity);
  const value = full.length > VALUE_MAX
    ? `${full.slice(0, VALUE_MAX)}… (truncated; memory_recall subject "${subject}" for the full value)`
    : full;
  return `- ${subject} | ${sanitise(f.attribute, 80)} = ${value}${since} [${sanitise(f.id, 40)}]`;
}
