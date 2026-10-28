# OpsFlow Roadmap

OpsFlow is evolving from an operational dashboard into a dependable workspace for task ownership, exception handling, performance visibility, and eventually workflow automation.

**Working method:** Learn → Build → Test → Understand → Improve → Repeat

Progress is marked complete only when the implementation exists. Validation tasks remain open until they have actually been checked.

---

## Current milestone — Product polish and reliability

**Status: UI and documentation polish implemented; production verification and multi-user validation remain open.**

- [x] Refine the dark visual system with a subtle atmospheric background and layered surfaces.
- [x] Align cursor and magnetic behavior with Aster: cursor feedback on interactive controls, magnetic movement only on explicitly marked elements.
- [x] Respect touch/coarse-pointer devices and reduced-motion preferences.
- [x] Improve dashboard wording and avoid presenting sample trends as verified business results.
- [x] Improve page title, description, and social-sharing metadata.
- [x] Refresh README, roadmap, and changelog to reflect the real implementation.
- [ ] Run and confirm the current production build and lint checks.
- [ ] Smoke-test the deployed site on desktop and mobile.

---

## Phase 1 — Functional foundation

**Status: Deployed**

- [x] Create the React + TypeScript + Vite application.
- [x] Define domain types for accounts, tasks, activities, KPIs, and operational exceptions.
- [x] Add related sample records and core business calculations.
- [x] Calculate task totals, overdue tasks, KPI target comparisons, and dashboard summaries.
- [x] Build a responsive operations dashboard with summary metrics, tasks, account health, activity, KPIs, and exception triage.
- [x] Add task search and status filters.
- [x] Add browser-local persistence as an early learning step.
- [x] Add a reset action for the sample workspace.
- [x] Deploy to GitHub Pages and correct the `/opsflow/` project-path entry script.
- [x] Add Aster-inspired cursor and magnetic interactions with touch and reduced-motion handling.

## Phase 2 — Shared workspace and reliability

**Status: Implemented; verification pending**

- [x] Design PostgreSQL tables for workspaces, members, tasks, and operational exceptions.
- [x] Add row-level security policies for authenticated workspace access.
- [x] Add email/password sign-up, sign-in, and sign-out.
- [x] Load the authenticated user's workspace and membership role.
- [x] Read tasks and exceptions from Supabase.
- [x] Save task and exception status changes to shared storage.
- [x] Restrict task and exception editing for viewer-role members.
- [x] Document Supabase setup and frontend credential safety.
- [ ] Verify shared updates with two separate accounts and browser sessions.
- [ ] Confirm workspace isolation and viewer restrictions under real test accounts.
- [ ] Verify loading, error, empty, and permission-denied states.
- [ ] Validate build, lint, and the live GitHub Pages deployment.
- [ ] Add an explicit, previewable import path if browser-local demo edits need to be migrated.

## Phase 3 — Operational data and insights

**Status: Planned**

- [ ] Add richer task filtering, sorting, and date-based views.
- [ ] Add historical operational trends.
- [ ] Move account data and activity history into the shared database.
- [ ] Expand KPI definitions, targets, and historical comparisons.
- [ ] Make operational rules configurable.
- [ ] Improve exception prioritization, assignment, and resolution workflows.
- [ ] Add useful audit history for shared changes.

## Phase 4 — APIs and integrations

**Status: Planned**

- [ ] Introduce a documented integration layer for external systems.
- [ ] Explore CRM and customer-data integrations.
- [ ] Synchronize selected operational records.
- [ ] Add robust loading, retry, and API error handling.
- [ ] Explore webhook-based events.

## Phase 5 — Workflow automation

**Status: Planned**

- [ ] Define clear triggers, conditions, and actions.
- [ ] Automate repetitive operational follow-ups.
- [ ] Add exception alerts and escalation rules.
- [ ] Explore Power Automate and Python-based automation.
- [ ] Add safeguards, auditability, and human review where appropriate.

## Phase 6 — Business intelligence

**Status: Future**

- [ ] Build historical KPI reporting and trend analysis.
- [ ] Add richer visualizations and operational reports.
- [ ] Explore Power BI and executive reporting.
- [ ] Connect reports to verified, shared operational data.

---

## Product direction

OpsFlow should move progressively from **showing what is happening** to identifying **what needs attention, who owns the next step, and what can safely be improved or automated**.

```text
Business Data
    ↓
Reliable Shared Workspace
    ↓
Operational Visibility
    ↓
Priorities & Exceptions
    ↓
Action & Accountability
    ↓
Automation
    ↓
Business Intelligence
```

## Guiding principle

> **Start with the data. Turn it into information. Turn information into action.**

Build in small steps, verify each milestone, and introduce complexity only when it solves a real operational problem.
