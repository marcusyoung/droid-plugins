---
id: TASK-1
title: Repackage Autolearn as a Factory Droid-only plugin
status: In Progress
assignee:
  - droid
created_date: '2026-11-12T00:22:00Z'
updated_date: '2026-11-14T19:34:00Z'
labels:
  - autolearn
dependencies: []
references:
  - https://github.com/marcusyoung/opencode-autolearn
documentation:
  - doc-1
  - doc-2
  - doc-3
  - doc-4
priority: high
type: feature
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Autolearn's core value is creating new skills automatically from repeated work. It was built for several harnesses (OpenCode, Cursor, pi), and only Factory Droid is now used. Keeping the multi-harness layers means every fix has to fit OpenCode-era data that no longer exists: the daily curator still reads OpenCode-only outcomes, so Droid skill use goes uncounted and skills are marked stale or archived.

Decision (2026-11-12): stop adapting around OpenCode, drop support for the other agents, and ship Autolearn as a Factory Droid plugin in this repository, alongside the handoff and connapse-memory plugins. The current multi-harness code and its history live in https://github.com/marcusyoung/opencode-autolearn (tracked there as TASK-14, superseded by this task).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Autolearn installs as a plugin from the droid-plugins marketplace and works in Factory Droid without the opencode-autolearn install scripts.
- [ ] #2 The reviewer, observer, Droid session search index and recurrence gate, and reviewer-driven skill creation work under Droid at least as well as the current deployment.
- [ ] #3 The plugin contains no OpenCode, Cursor or pi adapters, and nothing in it depends on OpenCode data being present.
- [ ] #4 Existing Autolearn state (skills, memories, usage records, search index, observations, wiki) carries over with a recoverable backup, and no created skill is lost or archived by the move.
- [ ] #5 The previous installation's hooks and scheduled jobs are retired so nothing runs twice after the plugin is installed.
- [ ] #6 Curator housekeeping counts Droid skill use before marking skills stale or archiving them.
- [ ] #7 Automated tests for the plugin live under tests/autolearn and pass.
- [ ] #8 The plugin README documents installation, configuration, scheduled jobs, the migration from the old installation, and how to roll back.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Objective and status
Draft for SDD checkpoint 1 (2026-11-14). Redesign the OpenCode-origin fork as a Factory-native plugin rather than a directory transplant. Preserve automatic reviewer-driven skill creation and all durable learning. No implementation is authorised.

Source: `C:\Users\myoun\git-repos\opencode-autolearn` (fork of `ericmjl/agent-autolearn`, not authored by the user; keep Eric Ma's MIT notice on substantial copied code). Destination: this repository.

## Evidence and decisions
`doc-4` holds the bounded architecture and Factory review: source references, exclusions and documentation URLs. Graph generation `2026-11-14T18:50:39Z`, 70 paths and six scopes checked, source fallback for excluded deployment/Git files and incomplete dynamic edges. No test suites, installed-state probes or real reviewers ran; only a fixture consistency check passed.

Settled by handoff `d9c2956d-9496-420d-811b-fd4e33f69797` and TASK-1/TASK-1.1: Droid-only marketplace distribution, automatic reviewer creation, preserved knowledge, housekeeping-only curator, reversible cutover. Old TASK-13 is superseded.

User decisions (2026-11-14):
- `doc-1`: count genuine parent and subagent invocations; exclude reviewer/curator automation; count invocations and flag uncertain Script-source evidence.
- `doc-2`: enforce recurrence and one skill mutation per review in code.
- `doc-3`: give retained local memory/profile context to normal sessions and the reviewer; Connapse stays separate.

Everything else is a proposal for approval. Task description and ACs are unchanged.

## Why redesign (source paths relative to source repo)
| Current mechanism | Evidence | Disposition |
|---|---|---|
| Droid adapter imports a core that generates OpenCode/pi wrappers | `plugin/autolearn-core.mjs:115-132,229-375` | Small Droid-only runtime modules |
| Cursor advances after detached launch; throttle is not a process lock | `plugin/autolearn-droid.mjs:156-168,225-234`; core `574-630` | Durable admission, supervised completion, idempotent retry |
| Skill CLI does not enforce reviewer safeguards | `skills/autolearn/scripts/autolearn.py:908-970` | Model proposes; deterministic code validates and applies |
| FTS holds historical evidence and distinct-session recurrence | autolearn `1282-1460`; `proposer.py:363-403` | Keep data and semantics; split from promotion |
| OpenCode-only usage repair runs after stale/archive | autolearn `294-315,1115-1206` | Droid evidence first, monotonic repair, completeness gate |
| Observer defaults to OpenCode global AGENTS | `improve.py:168-172` | Explicit Factory-aware destinations; keep rules |
| Composed context has no Droid consumer | doc-4 caller audit | SessionStart plus explicit reviewer context |
| Scheduler copies runtime and runs an LLM curator | `plugin/autolearn-schedule.mjs:114-189` | Deterministic local maintenance, one stable launcher |

Keep registry, retention, composer, wiki, ownership and provenance. Do not copy other-harness adapters, sync services, inspector UI, falsification/outcome verification or proposal promotion. Topic analytics have no located production sightings producer. Their historical files are preserved, but these optional runtime features are outside this release; approval covers that exclusion. The review is not a full security audit.

## Factory contracts
- Native plugin directories and `${DROID_PLUGIN_ROOT}` replace manual global hook installation. The cache is distribution, not state; git updates follow marketplace commits, not manifest version. [Plugins](https://docs.factory.com/harness/plugins)
- Command hooks get authoritative `transcript_path`, run in parallel and time out. No async hook mode is documented: hand off to an application worker and return promptly; test worker survival on Windows. Guard recursion with automation markers, opening-prompt classification and `stop_hook_active`. [Hooks](https://docs.factory.com/harness/hooks)
- `droid exec` supports appended system-prompt files, tool restriction and structured output. Verify tool IDs and output envelope. Autonomy is approval policy, not filesystem isolation. No nested custom droid, cloud API or hosted automation needed. [Exec](https://docs.factory.com/droid-exec/overview), [autonomy](https://docs.factory.com/autonomy-and-safety/auto-run)
- Personal skills live at `~/.factory/skills/<name>/SKILL.md`; new sessions rescan. Symlink discovery and live reload are unestablished, so publish owned regular directories. Approval-gated `/create-skill` cannot replace automatic creation. [Skills](https://docs.factory.com/harness/skills), [personal root](https://raw.githubusercontent.com/Factory-AI/factory/main/docs/cli/configuration/skills.mdx)
- `droid search` is bounded mixed-content search, not an exhaustive user-only recurrence API, so keep FTS. Sessions API needs entitlement and cloud sync; hosted schedules lack local state. [CLI](https://docs.factory.com/droid-cli/cli-reference), [Sessions](https://docs.factory.com/api-reference/sessions), [Automations](https://docs.factory.com/automations/overview)

## File surface and state
Create `autolearn/` with:
- `.factory-plugin/plugin.json`, `LICENSE`, `README.md`
- `hooks/{hooks.json,review.mjs,session-start.mjs}`
- `runtime/{paths,config,auth,admission,reviewer,health}.mjs`
- `scripts/{maintenance,schedule,migrate}.mjs`
- `skills/autolearn/SKILL.md`, `references/{observer,reviewer,curator,cli}.md`
- `skills/autolearn/scripts/{autolearn,improve,paths,config,droid_sessions,search,recurrence,usage,housekeeping,skills,registry,retention,composer,wiki,review_state}.py`
- `vendor/`: pinned, redistributable, non-evaluating JavaScript parser with licence and provenance; no hook-time downloads.

Modify `.factory-plugin/marketplace.json` and root `README.md`. Tests go in `tests/autolearn/{node,python,fixtures}`. Node keeps hook/process glue; Python keeps learning/data logic. `review_state.py` provides standard-library SQLite coordination for both, instead of two lock protocols.

Canonical knowledge stays at `AUTOLEARN_HOME` (default `~/.autolearn`); observer rules stay at `~/.agent-improvement`. Keep every persona and activate the current one. No implicit migration on import or informational commands.

### 1. Isolated baseline and state contract
Trace real imports and callers before each extraction. Baseline tests isolate HOME, USERPROFILE, AUTOLEARN_HOME, observer store, discovery root and subprocess environment, because legacy commands call `ensure_dirs`.

Read-only installed inventory: executable hashes, hooks, scheduled-task actions, discovery targets, cadence/auth config, flat/persona layouts. Handoff hashes and times are historical. Never print secrets or transcript content.

Account for memories, observations, profiles, skills and archives, usage, search DB, outcomes/proposals, curator state, wiki/impact/PURPOSE, observer rules and cursor/config metadata. Additive schema versions only; refuse ambiguous layout consolidation.

### 2. Droid evidence spine
Active sessions use the hook's transcript path. Maintenance roots are configured or discovered and validated; the documented `~/.factory/projects` and observed `~/.factory/sessions` are not hard-coded.

Shared classification, separate semantics: recurrence uses typed-user evidence; usage reads assistant tool invocations. Count genuine subagents; exclude reviewer/curator and their descendants. Unresolved ancestry blocks destructive ageing.

Keep FTS history and `droid:<message-id>` dedupe. A new usage schema backfills unchanged files despite old size/mtime watermarks. Handle append, truncation, compaction, copies, duplicate IDs and interrupted final records.

Parse direct `Skill` calls and literal `tools.Skill({skill: ...})` without evaluating JavaScript; ignore comments, string lookalikes and computed names, and report dynamic calls. Identity is session + invocation ID + literal occurrence. Script literals are uncertain evidence: they can protect a skill from ageing but are never reported as confirmed execution.

Persist events transactionally. Snapshot legacy usage once as a baseline; never lower `use_count`/`last_activity` or count evidence twice. Flag unknowable overlap rather than invent totals.

Ingestion returns a completeness verdict. Missing or unreadable roots, unresolved ancestry, malformed required evidence and DB errors are not zero use. Only a demonstrably incomplete trailing record may stay pending.

### 3. Search and enforced mutation admission
Split search/recurrence from the proposer. Preserve tokenisation, distinct user-session counting, overlap ≥0.5 and default minimum three sessions. Historical rows stay searchable without OpenCode files. Ship read-only search/recurrence; no scan/verify/promote.

The controller picks trusted indexed evidence and records source IDs, not model claims. Stale evidence stays searchable with a warning, but automatic mutation needs a completed refresh. This deliberately tightens the old stale-fallback path (`test_search_droid.py:433-444`); document it.

Stable review IDs plus a durable ledger allow at most one create/patch/archive per review across retries and workers. Automatic code cannot bypass it via raw `skill create`; operator actions stay separate.

### 4. Supervised automatic review
Keep cadence, forced flush on Stop/SessionEnd/PreCompact, spacing, content hash and daily cap. Hooks may overlap: reserve one slice atomically; advance `reviewedUpTo` only on successful completion or no-op, never on spawn.

A worker outliving the hook runs bounded `droid exec`, collects output and exit status, and records retry and health state. Keep API-key-first with verified stored-login fallback; move auth state out of the `cursor` path; key presence is not validity. Redact logs.

Reviewer runs with run-scoped instructions and a verified read-only tool allowlist. It receives precomputed FTS, recurrence, wiki and profile views, and can request more read-only searches through the controller. It returns versioned intent: allowed observation/memory/profile/wiki updates and zero or one skill mutation.

The controller validates schema, ownership, destinations, evidence and budget, then stages and applies automatically. Invalid output commits nothing and records a retryable failure. Transcript text is untrusted data. A read-only tool set is not an OS sandbox.

Journal queued/running/completed/no-op/failed states; recovery reuses review identity and staged operations. Test concurrent hooks, retries and manual writes for lost updates.

### 5. Retained learning and owned skills
Port registry, retention, composer, wiki and observer without imports from excluded modules. Replace OpenCode path defaults. Migration never rewrites global AGENTS.md or user rules. Keep the currently referenced `improve.py` path working through an owned compatibility launcher.

SessionStart injects a bounded composed memory/profile view via `additionalContext`; the reviewer gets the same view explicitly. Reuse existing ranking and budgets, report truncation, skip automation sessions. No Connapse access.

Canonical skills stay in the knowledge tree. Publish owned regular directories to a configurable root (default `~/.factory/skills`) with provenance/hash metadata and atomic staged replacement. Never overwrite manual or edited copies; report conflicts.

Route create, patch, manual archive, inactivity archive and prune through one ownership-checked, recoverable lifecycle. Keep pinned/manual exemptions and archives. Fresh evidence never auto-restores stale or archived skills.

### 6. Deterministic housekeeping (TASK-1.1)
Order: ingest → reconcile usage → check completeness → age/archive/prune → retention/wiki housekeeping → report. Incomplete evidence skips every destructive step. Keep thresholds and exemptions.

No curator LLM, falsification, scan, verify or promote. Skill-changing consolidation belongs to the reviewer. Report baselines, new evidence, confidence, coverage, skipped actions and promotion-disabled status. Re-plan TASK-1.1 against these modules at decomposition without weakening its ACs.

### 7. Scheduling, migration, rollback
Deterministic local maintenance replaces the LLM curator at the inventoried configured time (13:00 is historical). Retire the topics job at cutover; keep topic state. Windows Task Scheduler is the live target; document a POSIX command without claiming tested support.

One stable owned launcher outside the cache points to the validated plugin root with no copied logic. A missing or disabled plugin fails visibly without ageing. Test reinstall and cache relocation; document manual job removal on uninstall.

Migration is explicit dry-run/apply/rollback, never a SessionStart side effect:
1. Inventory owned hooks, jobs and launchers; present the exact retirement diff.
2. Quiesce old writers and in-flight reviews; disable old registrations reversibly.
3. Snapshot knowledge, rules, config, SQLite with sidecars, discovery targets and task definitions; checksum and test restore.
4. Keep state in place; add versioned tables/journals; publish without overwrites; install plugin and launcher.
5. Enable only the new path; restart Droid; verify one review per slice and one schedule.
6. First housekeeping run is report-only; record affected stale/archived skills without restoring. Enable destructive steps after counts reconcile.

Back up and validate config edits; leave unrelated hooks, settings and skills alone; never commit `.mcp.json`. Rollback quiesces new writers, snapshots post-cutover learning, restores compatible state and old registrations, and enables only the old path. Rehearse every phase before separately approved live actions.

## Validation
Done so far: bounded source/docs review; fixture check (13 unique IDs, six expected records). Nothing else has run.

Implementation checks:
- Isolated baseline, reproducing the two historical wiki failures separately first.
- From repo root, isolated profile: `node --test tests/autolearn/node/*.mjs` and `uv run --with pytest --with pyyaml --with python-slugify python -m pytest -p no:cacheprovider tests/autolearn/python -q`; pin any further dependency the extracted code needs.
- Parsing fixtures: direct, Script, subagent, comments/strings/computed names, ancestry, corrupt/tail records, replay, duplicates, backfill, incomplete roots.
- Source-derived recurrence edges: two vs three sessions, overlap just below/at 0.5, assistant-only, repeats, automation. Stale search allowed; mutation denied on incomplete refresh.
- Races and kills around reserve/spawn/intent/publish/complete: one review per slice, at most one mutation, no double count, cursor loss or lost update.
- Fake `droid exec`: auth failure, malformed output, timeout, no-op, recursion, redaction, real completion.
- No OpenCode/Cursor/pi files present; promotion entry points poisoned to fail on call.
- Migration/rollback fixtures: flat/persona/mixed, all personas, SQLite sidecars, archived/pinned/manual skills, old symlinks, edited copies, post-cutover learning; compare checksums.
- Temporary-profile Factory smoke: install, hooks, SessionStart context, fresh-session skill discovery, worker survival after hook exit.
- With approval, a real reviewer on recurring fixtures creates a skill with provenance, usage, wiki and discovery; non-recurring fixtures create none. Mocks alone cannot satisfy AC2.
- Measure first and later hook latency and full ingestion time; report real numbers.
- Repository tests, manifest and licence checks; an approved report-only live curator run for TASK-1.1 AC6.

AC map: #1 install smoke; #2 observer/context/search/recurrence/real creation; #3 no-legacy integration; #4 backup/rollback invariants; #5 single-path cutover; #6 TASK-1.1; #7 tests/autolearn; #8 README.

## Boundaries
Checkpoint 1 approves this design, the optional-feature exclusions and the tightened admission/discovery rules. Next: decompose (reusing TASK-1.1) and stop at checkpoint 2. Approval does not authorise implementing, installing, retiring live registrations, editing global instructions, restoring skills, committing or pushing. Follow living-integration-branch before branching. Tool IDs, auth envelope, worker survival, installed layout, discovery conflicts and performance are preflight gates: a failed probe means stop and report. The untracked `.factory/` stays untouched.

## Task Manifest
| # | Title | Files | Depends On | Labels | Acceptance Criterion |
|---|---|---|---|---|---|
| 1 | Define state contracts and isolated baseline | autolearn/README.md, tests/autolearn/fixtures/, tests/autolearn/python/test_migration.py | — | infra, test | Isolated baseline and versioned inventory fixtures cover all retained state without touching live paths. |
| 2 | Build Droid evidence ingestion | autolearn/skills/autolearn/scripts/{droid_sessions,usage}.py, autolearn/vendor/, tests/autolearn/fixtures/, tests/autolearn/python/test_{droid_sessions,usage}.py | 1 | logic, database, test | Direct and uncertain Script evidence deduplicates across parent/subagent fixtures with explicit completeness and automation exclusion. |
| 3 | Extract search and enforced recurrence | autolearn/skills/autolearn/scripts/{search,recurrence}.py, tests/autolearn/python/test_{search,recurrence}.py | 2 | logic, database, test | Historical FTS and the three-session/0.5 boundary pass source-derived tests without legacy DB dependencies. |
| 4 | Port learning and owned skill lifecycle | autolearn/skills/autolearn/scripts/{skills,registry,retention,composer,wiki,improve}.py, tests/autolearn/python/test_{skills,registry,retention,composer,wiki,observer}.py | 1, 3 | logic, test | Round-trip tests preserve learning and publish/archive only owned skills without overwriting manual or conflicting content. |
| 5 | Implement guarded review execution | autolearn/runtime/, autolearn/hooks/review.mjs, autolearn/skills/autolearn/scripts/review_state.py, autolearn/skills/autolearn/references/reviewer.md, tests/autolearn/node/ | 3, 4 | logic, infra, database, test | Concurrent and interrupted review tests commit at most one recurrent mutation per review and advance cursors only on success. |
| 6 | Complete housekeeping under TASK-1.1 | autolearn/skills/autolearn/scripts/housekeeping.py, autolearn/scripts/maintenance.mjs, autolearn/skills/autolearn/references/curator.md, tests/autolearn/python/test_housekeeping.py | 2, 4 | logic, database, test | Usage reconciles before lifecycle decisions and incomplete evidence skips destructive steps with no scan, verify or promote. |
| 7 | Package native hooks and context | autolearn/.factory-plugin/plugin.json, autolearn/hooks/{hooks.json,session-start.mjs}, autolearn/skills/autolearn/SKILL.md, autolearn/skills/autolearn/references/, autolearn/skills/autolearn/scripts/{autolearn,paths,config}.py, .factory-plugin/marketplace.json, autolearn/LICENSE, tests/autolearn/node/test-hook.mjs | 4, 5, 6 | infra, logic, test | A clean temporary Factory profile loads the plugin, session context and CLI without other-harness config. |
| 8 | Add reversible migration and scheduling | autolearn/scripts/{migrate,schedule}.mjs, tests/autolearn/node/test-{migration,schedule}.mjs, tests/autolearn/python/test_migration.py | 7 | infra, database, test | Cutover-failure and rollback fixtures preserve state and leave exactly one owned execution path. |
| 9 | Validate end to end and document cutover | autolearn/README.md, README.md, tests/autolearn/, TASK-1 implementation notes | 8 | test, infra | Automated tests, approved real-Factory creation and migration/rollback evidence cover all eight parent ACs with no unreported gaps. |
<!-- SECTION:PLAN:END -->
