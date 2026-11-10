// Preload for hook tests: replaces the `connapse` CLI with a fixture-driven fake.
// CM_FIXTURE: { spaces: { name: [fact] }, maxPage? }; calls are appended to CM_CALLS.
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
  if (args[0] === "api" && args[1] === "POST") return "{}";
  if (args[0] !== "memory" || args[1] !== "list") fail("unknown command");
  const facts = fixture.spaces[opt("--space")];
  if (!facts) fail("Space not found");
  const start = Number(opt("--cursor") || 0);
  const size = Math.min(Number(opt("--limit")), fixture.maxPage ?? Infinity);
  const end = start + size;
  return JSON.stringify({
    facts: facts.slice(start, end).map((fact) => ({ fact, sources: [] })),
    nextCursor: end < facts.length ? String(end) : null,
  });
};
syncBuiltinESMExports();
