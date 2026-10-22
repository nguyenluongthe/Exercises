---
name: ralph
description: "Convert PRDs to prd.json format for the Ralph autonomous agent system. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create prd.json from this, ralph json."
---

# Ralph PRD Converter

Converts existing PRDs to the `prd.json` format that Ralph uses for autonomous execution loops.

---

## The Job

Take a PRD (markdown file or text) and convert it to `prd.json` in your project root or `scripts/ralph/` directory.

---

## Output Format

```json
{
  "project": "[Project Name]",
  "branchName": "ralph/[feature-name-kebab-case]",
  "description": "[Feature description from PRD title/intro]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Story title]",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## Story Size: The Number One Rule

**Each story must be completable in ONE iteration (one context window).**

Autonomous agents spawn fresh iterations with clean context. If a story is too big, the agent runs out of context before finishing and produces broken code.

### Right-sized stories:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action / service with new logic
- Add a filter dropdown to a list

### Too big (split these):
- "Build the entire dashboard" - Split into: schema, queries, UI components, filters
- "Add authentication" - Split into: schema, middleware, login UI, session handling
- "Refactor the API" - Split into one story per endpoint or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

---

## Story Ordering: Dependencies First

Stories execute in priority order. Earlier stories must not depend on later ones.

**Correct order:**
1. Schema / database changes (migrations)
2. Server actions / backend logic / services
3. UI components that consume backend logic
4. Dashboard / summary views aggregating data

**Wrong order:**
1. UI component (depends on schema/API that does not exist yet)
2. Schema change

---

## Acceptance Criteria: Must Be Verifiable

Each criterion must be something that can be verified and checked programmatically or visually, not something vague.

### Good criteria (verifiable):
- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Clicking delete shows confirmation dialog"
- "Typecheck passes"
- "Tests pass"

### Bad criteria (vague):
- "Works correctly"
- "User can do X easily"
- "Good UX"
- "Handles edge cases"

### Always include as final criterion:
```
"Typecheck passes"
```

For stories with testable logic, also include:
```
"Tests pass"
```

### For stories that change UI, also include:
```
"Verify in browser"
```

Frontend stories are NOT complete until visually verified.

---

## Conversion Rules

1. **Each user story becomes one JSON entry**
2. **IDs:** Sequential (`US-001`, `US-002`, etc.)
3. **Priority:** Based on dependency order, then document order
4. **All stories initialized with:** `"passes": false` and empty `"notes": ""`
5. **branchName:** Derive from feature name, kebab-case, prefixed with `ralph/`
6. **Always add:** `"Typecheck passes"` to every story's acceptance criteria

---

## Splitting Large PRDs

If a PRD has big features, split them:

**Original:**
> "Add user notification system"

**Split into:**
1. `US-001`: Add notifications table to database
2. `US-002`: Create notification service for sending notifications
3. `US-003`: Add notification bell icon to header
4. `US-004`: Create notification dropdown panel
5. `US-005`: Add mark-as-read functionality
6. `US-006`: Add notification preferences page

Each is one focused change that can be completed and verified independently.

---

## Archiving Previous Runs

Before writing a new `prd.json`, check if there is an existing one from a different feature:

1. Read the current `prd.json` if it exists
2. Check if `branchName` differs from the new feature's branch name
3. If different AND `progress.txt` has content beyond the header:
   - Create archive folder: `archive/YYYY-MM-DD-feature-name/`
   - Copy current `prd.json` and `progress.txt` to archive
   - Reset `progress.txt` with fresh header

---

## Checklist Before Saving

Before writing `prd.json`, verify:

- [ ] Previous run archived (if `prd.json` exists with different `branchName`)
- [ ] Each story is completable in one iteration (small enough)
- [ ] Stories are ordered by dependency (schema to backend to UI)
- [ ] Every story has "Typecheck passes" as criterion
- [ ] UI stories have "Verify in browser" as criterion
- [ ] Acceptance criteria are verifiable (not vague)
- [ ] No story depends on a later story
