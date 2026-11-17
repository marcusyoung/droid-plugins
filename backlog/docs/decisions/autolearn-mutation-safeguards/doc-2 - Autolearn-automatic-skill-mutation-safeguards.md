---
id: doc-2
title: Autolearn automatic skill-mutation safeguards
type: other
created_date: '2026-11-14T19:28:00Z'
---
# Decision: Enforce automatic skill-mutation safeguards

Date: 2026-11-14
Status: Accepted by the user during TASK-1 planning.

## Decision
Enforce the reviewer recurrence gate and at most one skill mutation per review in code, not only in reviewer instructions. Automatic reviewer-driven skill creation remains required.

## Rationale
The existing skill-create CLI does not enforce the safeguards promised by reviewer instructions. Moving to Factory must preserve automatic creation while making those guarantees testable.

## Consequences
Use stable review identities, trusted transcript evidence, durable admission records and idempotent completion. No native approval-dependent create-skill workflow as a replacement. Curator remains housekeeping-only. Existing recurrence defaults and historical evidence are preserved unless separately approved.

## Sources
User answer in the current TASK-1 planning session, 2026-11-14. Source audit: opencode-autolearn skills/autolearn/scripts/autolearn.py:908-970 and skills/autolearn/references/reviewer.md.
