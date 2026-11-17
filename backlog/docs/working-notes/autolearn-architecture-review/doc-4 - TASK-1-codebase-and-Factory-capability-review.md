---
id: doc-4
title: TASK-1 codebase and Factory capability review
type: other
created_date: '2026-11-14T19:29:00Z'
---
# TASK-1 architecture and Factory capability review

Date: 2026-11-14. Research only; not an implementation approval.

## Scope and confidence
Tier-3 bounded audit of the fork's runtime: plugin adapters/core/auth/scheduler; autolearn CLI; observer; Droid transcripts/search/recurrence; skill lifecycle; registry/retention/composer/wiki; installers; dependency boundaries for outcomes, proposals, falsification, sync, inspector and topic analytics. Graph project `C-Users-myoun-git-repos-opencode-autolearn`, full generation `2026-11-14T18:50:39Z`, 2,095 nodes/6,082 edges. Relevant pagination completed; 70/70 paths and six scope records checked; excluded deployment and Git metadata source-read. Graph dynamic dispatch/injected callbacks are incomplete and some injected spawn edges resolve into tests, so source traces settle material claims. No runtime tests or installed-state probes performed. Fixture consistency only: 13 unique IDs and six expected retained records, including intentionally malformed/null records.

Excluded: sync backend implementation audits, generated files, exhaustive upstream authorship, full correctness/security audit, live transcripts, installed configuration/jobs and authenticated execution. These exclusions remain explicit implementation preflight work where relevant, not evidence that the entire deployment is verified.

## Provenance
Source root: `C:\Users\myoun\git-repos\opencode-autolearn`.
`.git/config:8-17` identifies upstream ericmjl/agent-autolearn and fork origin marcusyoung/opencode-autolearn; reflog confirms clone and later Windows/Droid/search additions, not line-level authorship. Preserve Eric Ma's MIT notice (`LICENSE:1-13`) for copied substantial code.

## Evidence and disposition
Paths below are relative to the source root.
- Droid hooks already supply transcript paths and cadence: `plugin/autolearn-droid.mjs:89-168,187-234,241-260,362-381`. Retain slice/cadence, opening-prompt recursion guard and automatic review; replace packaging and launch-completion handling.
- Native adapter still calls core ensureStore/ensureWrapper: `plugin/autolearn-core.mjs:115-132,229-375`. Remove OpenCode/pi wrapper/config side effects rather than port core wholesale.
- Shared throttle is read/write state, not interprocess admission; detached launch advances cursor without confirmed review completion: core `574-630`; Droid adapter `156-168,225-234`. Add durable review IDs, locking and completion.
- Droid auth is deliberate API-key-first/stored-login-probe behaviour, but auth state lives under cursor: `plugin/autolearn-auth.mjs:26-27,139-218`. Extract and migrate; key presence alone is not validation.
- Skill creation scaffolds files, usage/provenance/discovery but does not enforce reviewer recurrence/one-mutation promises: `skills/autolearn/scripts/autolearn.py:908-970`; reviewer instructions `references/reviewer.md:46-270`. Enforce via controller, preserving automatic creation.
- Observer has independent rules store/locking/escalation but global path defaults to OpenCode: `scripts/improve.py:34-38,122-129,168-172,245-325,356-463`. Preserve rules; replace destinations, do not rewrite unrelated global instructions during migration.
- Typed-user/assistant indexing, automation exclusion and stable identities are deliberate Droid additions: `scripts/droid_sessions.py:62-157`; `scripts/autolearn.py:1282-1460`. Retain their semantics, separate from skill-invocation evidence.
- Recurrence is distinct-session user-text token-overlap coefficient >=0.5, default three sessions: `scripts/proposer.py:33-37,363-403`. Extract only needed gate, not proposal promotion.
- Existing recurrence can use stored evidence after refresh failure: proposer `73-84`; `scripts/test_search_droid.py:433-444`. Do not misdescribe old behaviour as fail-closed; record any deliberate new creation guard separately.
- Usage repair is OpenCode-only and may lower counts; housekeeping ages before repair: `scripts/autolearn.py:294-315,1115-1206`; `scripts/outcomes.py:390-414`. Replace with monotonic baseline plus idempotent Droid evidence, repair first, skip destructive work on incomplete evidence.
- Archive code paths inconsistently unlink discovery: autolearn `533-542,1052-1062,1135-1141`. Unify owned-target lifecycle.
- Registry/retention/composer/wiki are useful durable learning mechanisms: `scripts/registry.py:147-268`, `composer.py:49-99`, `wiki.py:101-120,263-319,411-430`; autolearn `710-729,950-963,1022-1033`. Preserve data and provenance; atomic replacement alone is not lost-update protection.
- No proven memory-context injection caller in Droid adapter; legacy injection belongs to OpenCode adapters. Provide native SessionStart and explicit reviewer context.
- Scheduler duplicates runtime into bin and launches LLM curator/topics: `plugin/autolearn-schedule.mjs:114-189,333-406`. Replace with deterministic local maintenance and one stable launcher; health must correlate actual review IDs.
- Complete bounded source search found topic record_sightings production callers absent, only tests. Do not silently re-enable a scanner without an evidence producer.
- Installers delete/replace bundled skills and mutate multi-harness config: `install.sh:127-134`; `deploy/windows/install-windows.ps1:85-210`; `deploy/windows/merge-opencode.py:18`. Do not reuse as migration machinery.
- JS/Python partial flat-to-persona migration lists differ and both stop on personas presence: core `134-159`; autolearn `152-190`. Inventory mixed layouts and all personas before any move.

## Factory contracts and limits
Verified official documentation 2026-11-14:
- Native plugin root has skills/, hooks/hooks.json, droids/, commands/, mcp.json as applicable; `${DROID_PLUGIN_ROOT}` resolves cached plugin path. Cache is executable distribution, not durable state. https://docs.factory.com/harness/plugins
- Command hooks get JSON stdin including cwd/session_id/transcript_path; parallel execution, timeout and recursion rules apply. No documented async hook mode; detached/supervised work is plugin application logic. SessionStart can inject additionalContext. https://docs.factory.com/harness/hooks
- Headless exec supports run-scoped appended system prompt files, tool restriction and structured output. Unknown tool IDs fail startup; medium autonomy is approval policy, not filesystem isolation. https://docs.factory.com/droid-exec/overview and https://docs.factory.com/autonomy-and-safety/auto-run
- Native skills use SKILL.md; personal root is ~/.factory/skills. New sessions rescan; live reload and external symlink discovery are not established. https://docs.factory.com/harness/skills and https://raw.githubusercontent.com/Factory-AI/factory/main/docs/cli/configuration/skills.mdx
- Native create-skill requires approval, so it cannot replace required automatic creation. Native droids are useful for in-session delegation, not a persistent scheduler; no redundant nested reviewer droid is required. https://docs.factory.com/harness/subagents
- droid search is bounded search over messages/documents/tools. Exhaustive user-only machine-readable results and index freshness are not established, so it cannot replace the recurrence FTS contract on current evidence. https://docs.factory.com/droid-cli/cli-reference
- Public Sessions API is org-gated and cloud-sync dependent. Do not require it or external services for local learning. https://docs.factory.com/api-reference/sessions
- Hosted automations do not establish access to local knowledge while the machine is off; retain local scheduling for local state. https://docs.factory.com/automations/overview

Documentation's ~/.factory/projects transcript example differs from observed parser/handoff ~/.factory/sessions. Use hook transcript_path and verified configured maintenance roots, not either hard-coded assumption. MCP matcher spelling and symlink support remain local-test questions; do not base the design on them.

## Decision evidence sweep
Prior handoff `d9c2956d-9496-420d-811b-fd4e33f69797` and destination TASK-1/TASK-1.1 settle Droid-only marketplace distribution, automatic reviewer creation, state preservation, housekeeping-only curator and reversible cutover. Old TASK-13 is explicitly superseded; it cannot restore conditional OpenCode promotion. Source task 10/10.1/10.2 records deliberate Droid auth/cadence/recursion/typed-user indexing, not wholesale endorsement of legacy architecture. Current user answers are recorded separately in doc-1 (usage), doc-2 (enforced mutation guards), doc-3 (context). No pre-existing destination Backlog documents were found.

## Validation status
No implementation or tests run. Historical pass counts, skill totals and archive statistics are not fresh measurements. Baseline tests must isolate HOME, USERPROFILE, AUTOLEARN_HOME, observer/discovery paths and subprocesses: even legacy informational commands may call ensure_dirs and mutate state. Reproduce the two historical wiki failures independently before classifying regressions.
