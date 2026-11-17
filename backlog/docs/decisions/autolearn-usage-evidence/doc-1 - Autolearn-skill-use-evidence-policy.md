---
id: doc-1
title: Autolearn skill-use evidence policy
type: other
created_date: '2026-11-14T19:28:00Z'
---
# Decision: Autolearn skill-use evidence

Date: 2026-11-14
Status: Accepted by the user during TASK-1 planning.

## Decision
Count genuine parent and subagent skill invocations. Exclude reviewer and curator sessions, including their automated descendants. Count invocations rather than requiring confirmed successful activation. Label Script-source literal matches as uncertain evidence, not confirmed execution or successful activation.

## Rationale
Delegated work is genuine usage. Script-wrapped calls must contribute without claiming more execution evidence than transcripts provide. Stable evidence identities prevent repeat counting; incomplete evidence must not enable destructive housekeeping.

## Consequences
Retain direct versus Script-source provenance and confidence. Do not execute Script source. Define a literal occurrence as evidence, not a loop execution count; ignore comments, strings and computed names. Missing or unreadable required evidence skips ageing/pruning. No automatic stale or archived skill restoration.

## Sources
User answers in the current TASK-1 planning session, 2026-11-14. TASK-1.1 supplies the parsing, idempotence and fail-closed housekeeping requirements.
