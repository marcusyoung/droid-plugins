---
id: doc-3
title: Autolearn local context consumption
type: other
created_date: '2026-11-14T19:28:00Z'
---
# Decision: Consume retained Autolearn local context

Date: 2026-11-14
Status: Accepted by the user during TASK-1 planning.

## Decision
Make retained Autolearn local memory/profile context available both to normal Droid sessions and the automatic reviewer. Keep Connapse facts and routing separate; do not copy them into Autolearn.

## Rationale
Preserving files alone does not make the learning loop useful in Droid. The old Droid adapter has no proven caller for its legacy context-injection mechanism.

## Consequences
Plan a bounded SessionStart context view for normal sessions and explicit run-scoped context for headless reviews. Preserve all existing memory/profile data and provenance. Do not automatically rewrite unrelated global instructions or duplicate Connapse ownership.

## Sources
User answer in the current TASK-1 planning session, 2026-11-14; source audit of autolearn-droid.mjs versus legacy core injectInstructions/composeContext callers; Factory hooks and headless execution documentation.
