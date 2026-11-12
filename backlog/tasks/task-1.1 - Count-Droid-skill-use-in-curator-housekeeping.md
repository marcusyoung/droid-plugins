---
id: TASK-1.1
title: Count Droid skill use in curator housekeeping
status: To Do
assignee: []
created_date: '2026-11-12T00:22:00Z'
labels:
  - autolearn
dependencies: []
references:
  - >-
    https://github.com/marcusyoung/opencode-autolearn/blob/main/backlog/tasks/task-13%20-%20Give-the-daily-curators-proposal-pipeline-a-Droid-evidence-source.md
parent_task_id: TASK-1
priority: medium
type: bug
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The daily curator marks Autolearn-created skills stale after 30 days without recorded use and archives them after 90. It reads skill use only from OpenCode-derived outcomes, so skills loaded in Droid sessions look unused. On 2026-11-12, 7 Autolearn skills were stale (marked between 16 Oct and 7 Nov) and 4 with zero recorded uses had been archived on 3 Nov. Usage repair also runs after the stale and archive step, so even recorded use arrives too late.

The curator's proposal and auto-promotion route is out of scope: in 44 runs since 2026-09-20 it never promoted anything, because verification refuses to re-run commands other than test runners. The reviewer is the route that creates new skills.

Evidence from bounded live checks of Droid transcripts (2026-11-12): direct skill loads are `tool_use` blocks named `Skill` with input `{"skill": "<name>"}`; Script-wrapped loads appear as `tools.Skill({skill: "<name>"})` inside the Script `script` source, with literal names in every sampled case. `tool_use.id` is unique; the timestamp is on the enclosing message line. Reviewer and curator sessions are identified by their opening prompt. Earlier analysis and a plan against the old repository: opencode-autolearn TASK-13.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The curator counts skill loads from Droid sessions, both direct and Script-wrapped with literal names, in each skill's use count and last-activity date.
- [ ] #2 Usage is updated before stale marking, archiving and unused pruning, and a failed update skips those steps instead of acting on missing evidence.
- [ ] #3 Skill-use evidence excludes reviewer and curator sessions and is not double-counted across repeated curator runs.
- [ ] #4 The curator does not run proposal scan, verification or promotion, and its report says so.
- [ ] #5 Automated tests cover skill-use parsing, idempotent counting, usage updates, step ordering and the absence of promotion.
- [ ] #6 After deployment, a curator run on this machine shows Droid skill uses counted, and the affected stale or archived skills are recorded in the task without being restored automatically.
- [ ] #7 Curator documentation describes the skill-use evidence and that promotion is not performed.
<!-- AC:END -->
