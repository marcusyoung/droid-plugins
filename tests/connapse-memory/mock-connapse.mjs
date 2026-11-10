// Preload for hook tests: replaces the `connapse` CLI with a fixture-driven fake.
// CM_FIXTURE: { spaces: { name: [fact] }, maxPage?, delayMs? }; calls are appended to CM_CALLS.
// Like the server, it rejects limits outside 1 to 100; like execFileSync, it honours opts.timeout.
import fs from "node:fs";
import { createRequire, syncBuiltinESMExports } from "node:module";
const cp = createRequire(import.meta.url)("node:child_process");
const real = cp.execFileSync;
const fixture = JSON.parse(fs.readFileSync(process.env.CM_FIXTURE, "utf8"));
const fail = (stderr) => { throw Object.assign(new Error("connapse failed"), { status: 1, stdout: "", stderr }); };

cp.execFileSync = (file, args, opts) => {
  if (file !== "connapse") return real(file, args, opts);
  fs.appendFileSync(process.env.CM_CALLS, JSON.stringify(args) + "\n");
  const opt = (n) => { const i = args.indexOf(n); return i < 0 ? null : args[i + 1]; };
  if (fixture.delayMs) {
    const wait = Math.min(fixture.delayMs, opts?.timeout || Infinity);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait);
    if (wait < fixture.delayMs) throw Object.assign(new Error("timed out"), { signal: "SIGTERM", stdout: "", stderr: "" });
  }
  if (args[0] === "api" && args[1] === "POST") return "{}";
  if (args[0] !== "memory" || args[1] !== "list") fail("unknown command");
  const facts = fixture.spaces[opt("--space")];
  if (!facts) fail("Space not found");
  const limit = Number(opt("--limit"));
  if (!(limit >= 1 && limit <= 100)) fail("limit must be 1 to 100.");
  const start = Number(opt("--cursor") || 0);
  const size = Math.min(limit, fixture.maxPage ?? Infinity);
  const end = start + size;
  return JSON.stringify({
    facts: facts.slice(start, end).map((fact) => ({ fact, sources: [] })),
    nextCursor: end < facts.length ? String(end) : null,
  });
};
syncBuiltinESMExports();
