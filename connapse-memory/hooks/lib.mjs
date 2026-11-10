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
  promptRecall: { enabled: true, limit: 8, maxKeywords: 12, budgetMs: 15000 },
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

function checkoutName(dir) {
  const base = path.basename(dir);
  return base.toLowerCase() === ".git" ? path.basename(path.dirname(dir)) : base.replace(/\.git$/i, "");
}

// Linked worktrees resolve to the main checkout's name, so every worktree of
// a repository maps to the same space. `repo` is false outside a git checkout.
// The common git directory is not used for the name because `--separate-git-dir`
// can put it anywhere under any name. For a linked worktree of such a repository,
// git itself does not record the main checkout, so the git directory's name is used.
export function projectInfo(cwd) {
  let dirs;
  try {
    dirs = git(cwd, ["rev-parse", "--path-format=absolute", "--git-dir", "--git-common-dir"]).split(/\r?\n/);
  } catch {
    return { name: path.basename(cwd), repo: false };
  }
  const [gitDir, common] = dirs;
  let top;
  try {
    top = path.resolve(gitDir) !== path.resolve(common)
      ? git(cwd, ["worktree", "list", "--porcelain"]).split(/\r?\n/)[0].replace(/^worktree /, "")
      : git(cwd, ["rev-parse", "--show-toplevel"]);
  } catch {
    top = common; // bare repository, or cwd inside the git directory
  }
  return { name: checkoutName(top) || checkoutName(common), repo: true };
}

// Connapse rejects container names longer than this (PathUtilities.IsValidContainerName).
const SPACE_NAME_MAX = 128;

// One space per repository; outside a repository, the shared default space,
// so stray working directories never create spaces.
export function resolveSpace(config, project) {
  if (!project.repo) return { space: config.defaultSpace, perRepo: false };
  const room = SPACE_NAME_MAX - String(config.spaceSuffix).length;
  const slug = project.name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-")
    .replace(/^-/, "").slice(0, Math.max(room, 0)).replace(/-$/, "");
  return slug ? { space: slug + config.spaceSuffix, perRepo: true } : { space: config.defaultSpace, perRepo: false };
}

function cli(config, args, timeoutMs = config.cliTimeoutMs) {
  try {
    const out = execFileSync("connapse", args, {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: timeoutMs, windowsHide: true,
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

// `memory list --json` prints a page: { facts: [{ fact, sources }], nextCursor }.
function parsePage(out) {
  const parsed = JSON.parse(out);
  const items = Array.isArray(parsed) ? parsed : parsed.facts || [];
  return {
    facts: items.map((i) => (i && i.fact) || i).filter(Boolean),
    nextCursor: (!Array.isArray(parsed) && parsed.nextCursor) || null,
  };
}

// Connapse rejects list limits outside 1 to this (MemoryPaging.MaxLimit).
export const LIST_LIMIT_MAX = 100;

// Returns { ok, facts, nextCursor, error }. Never throws: a missing or
// signed-out CLI must not break a hook.
export function listFacts(config, space, { limit, query, cursor, timeoutMs } = {}) {
  const args = ["memory", "list", "--space", space, "--limit", String(limit ?? config.injectFacts), "--json"];
  if (query) args.push("--query", query, "--sort", "relevance");
  if (cursor) args.push("--cursor", cursor);
  const r = cli(config, args, timeoutMs);
  if (!r.ok) return { ok: false, facts: [], nextCursor: null, error: r.error };
  try { return { ok: true, ...parsePage(r.out) }; } catch { return { ok: false, facts: [], nextCursor: null, error: "unreadable CLI output" }; }
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

// Fact text is written by agents and is injected inside <connapse_memory> tags,
// so markup characters are encoded to stop a fact closing or forging a block.
export function escapeMarkup(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function collapse(s) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

export function sanitise(s, max = 300) {
  return escapeMarkup(collapse(s).slice(0, max));
}

const VALUE_MAX = 300;

export function formatFact(f) {
  const since = f.validFrom ? ` (since ${sanitise(f.validFrom, 10)})` : "";
  const subject = sanitise(f.subject, 80);
  const full = collapse(f.value);
  const value = full.length > VALUE_MAX
    ? `${escapeMarkup(full.slice(0, VALUE_MAX))}… (truncated; memory_recall subject "${subject}" for the full value)`
    : escapeMarkup(full);
  return `- ${subject} | ${sanitise(f.attribute, 80)} = ${value}${since} [${sanitise(f.id, 40)}]`;
}
