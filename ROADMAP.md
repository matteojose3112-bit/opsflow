# OpsFlow Roadmap

OpsFlow is a focused operations workspace for task ownership, exception handling, and performance visibility, with a longer-term direction toward safe workflow automation.

**Working method:** Learn → Build → Test → Understand → Improve → Repeat

Progress is marked complete only when the implementation exists. External validation tasks remain open until they have actually been checked.

---

## Current milestone — Deployed MVP closeout

**Status: Frontend MVP and shared-storage integration implemented; maintenance mode while external validation remains outstanding.**

- [x] Build the responsive operations dashboard and core task/exception views.
- [x] Add task search, status filters, overdue calculations, and KPI snapshot calculations.
- [x] Add email/password authentication and workspace membership loading.
- [x] Connect task and exception reads/status updates to workspace-scoped Supabase tables.
- [x] Add RLS policies for workspace membership and role-based access.
- [x] Enforce viewer read-only controls in the interface and database policies.
- [x] Configure GitHub Actions CI for TypeScript/production build and Oxlint.
- [x] Configure GitHub Pages deployment for the `/opsflow/` project path.
- [x] Document implemented scope, sample-data boundaries, and credential safety.
- [ ] Verify shared updates with two separate accounts and browser sessions.
- [ ] Verify workspace isolation and viewer restrictions with direct API requests.
- [ ] Verify anonymous access is denied in the configured Supabase project.
- [ ] Smoke-test deployed desktop/mobile layouts, keyboard focus, and error states.

## Phase 1 — Functional dashboard foundation

**Status: Implemented and deployed**

- [x] Create the React + TypeScript + Vite application.
- [x] Define domain types for accounts, tasks, activities, KPIs, and operational exceptions.
- [x] Add sample records and core business calculations.
- [x] Build the responsive operations dashboard.
- [x] Add task search and status filters.
- [x] Add browser-local persistence as an early learning step.
- [x] Deploy to GitHub Pages and correct the `/opsflow/` project-path entry script.
- [x] Add reduced-motion and touch-device handling.

## Phase 2 — Authentication and shared workspace integration

**Status: Implemented in code; live security and multi-user validation pending**

- [x] Design PostgreSQL tables for workspaces, members, tasks, and operational exceptions.
- [x] Add row-level security policies for authenticated workspace access.
- [x] Add email/password sign-up, sign-in, and sign-out.
- [x] Load the authenticated user's workspace and membership role.
- [x] Read tasks and exceptions from Supabase.
- [x] Save task and exception status changes to shared storage.
- [x] Restrict task and exception editing for viewer-role members in the UI and database policies.
- [x] Document Supabase setup and frontend credential safety.
- [ ] Verify shared updates with two separate accounts and browser sessions.
- [ ] Confirm workspace isolation and viewer restrictions under real test accounts.
- [ ] Verify anonymous access denial and permission-denied behavior.
- [ ] Verify loading, empty, and recoverable network-error states.
- [ ] Add an explicit, previewable import path if browser-local demo edits need migration.

## Phase 3 — Operational data and insights

**Status: Deferred**

- [ ] Move account data and activity history into the shared database.
- [ ] Add richer task filtering, sorting, and date-based views.
- [ ] Add historical operational trends and verified KPI reporting.
- [ ] Expand KPI definitions, targets, and historical comparisons.
- [ ] Make operational rules configurable.
- [ ] Improve exception prioritization, assignment, and resolution workflows.
- [ ] Add useful audit history for shared changes.

## Phase 4 — APIs and integrations

**Status: Deferred**

- [ ] Introduce a documented integration layer for external systems.
- [ ] Explore CRM and customer-data integrations.
- [ ] Synchronize selected operational records.
- [ ] Add robust loading, retry, and API error handling.
- [ ] Explore webhook-based events.

## Phase 5 — Workflow automation

**Status: Future direction**

- [ ] Define clear triggers, conditions, and actions.
- [ ] Automate repetitive operational follow-ups.
- [ ] Add exception alerts and escalation rules.
- [ ] Explore Power Automate and Python-based automation.
- [ ] Add safeguards, auditability, and human review where appropriate.

## Phase 6 — Business intelligence

**Status: Future direction**

- [ ] Build historical KPI reporting and trend analysis.
- [ ] Add richer visualizations and operational reports.
- [ ] Explore Power BI and executive reporting.
- [ ] Connect reports only to verified, shared operational data.

---

## Product direction

OpsFlow should move progressively from **showing what is happening** to identifying **what needs attention, who owns the next step, and what can safely be improved or automated**.

The current release is a portfolio MVP. Future development should be driven by verified operational needs rather than adding complexity for its own sake.

## Guiding principle

> **Start with the data. Turn it into information. Turn information into action.**

Build in small steps, verify each milestone, and introduce complexity only when it solves a real operational problem.
