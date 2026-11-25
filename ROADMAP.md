# OpsFlow Roadmap

OpsFlow is a focused operations workspace for task ownership, exception handling, and performance visibility, with a longer-term direction toward safe workflow automation.

**Working method:** Learn → Build → Test → Understand → Improve → Repeat

Progress is marked complete only when the implementation exists. External validation remains open until it has actually been performed. Hosted Supabase changes require separate explicit authorization.

---

## Current milestone — Account data foundation

**Status: Planned · Not implemented**

The next development milestone is to replace illustrative account data with workspace-scoped shared records. Tasks already reference accounts, so a persistent account model is the next dependency for reliable account health, activity, and KPI reporting.

- [ ] Review existing account/task domain types and sample-data dependencies.
- [ ] Define the accounts table, workspace foreign key, timestamps, constraints, and indexes.
- [ ] Add an additive Supabase migration with RLS enabled from creation.
- [ ] Define least-privilege read/write policies for owner, admin, member, viewer, and non-member roles.
- [ ] Add pgTAP tests for workspace isolation and role permissions using at least two workspaces.
- [ ] Add typed account data access and loading/empty/error states.
- [ ] Replace sample account reads only after the shared path and tests pass.
- [ ] Update README, roadmap, and changelog with implemented scope and validation results.
- [ ] Run build, lint, reliability tests, and disposable local Supabase tests on the exact same commit.
- [ ] Open a reviewable PR; do not merge or deploy until explicitly authorized.
- [ ] Do not apply migrations or modify hosted Supabase without separate explicit approval.

## Completed milestone — Multi-workspace access controls

**Status: Merged to `main` and deployed · Commit `b0912a6`**

- [x] Load all workspaces visible through the signed-in user's memberships and display the user's role.
- [x] Add a workspace selector that reloads tasks and exceptions within the selected workspace.
- [x] Surface workspace-switch failures without silently replacing the active workspace.
- [x] Add two-workspace pgTAP fixtures and cross-workspace read/update denial assertions.
- [x] Add direct database regression checks that viewers cannot update tasks or exceptions.
- [x] Pass CI and disposable local Supabase migration/pgTAP tests on the PR head.
- [x] Merge the reviewed change to `main`.
- [x] Pass post-merge CI, database security workflow, and GitHub Pages deployment.
- [ ] Validate workspace switching with distinct hosted test identities and browser sessions.

## Completed milestone — Workspace ownership security

**Status: Merged to `main` · Hosted validation remains outstanding**

- [x] Separate ownership changes from ordinary workspace and membership CRUD.
- [x] Restrict generic owner-id and membership-identity updates with column-level grants and RLS policies.
- [x] Protect owner membership from generic role changes and deletion.
- [x] Add an owner-only atomic ownership-transfer function.
- [x] Add pgTAP tests for owner/admin/member/viewer/non-member behavior and owner transfer.
- [x] Add a disposable local Supabase GitHub Actions workflow.
- [x] Pass expanded database regression tests in CI.
- [ ] Verify direct API behavior with distinct hosted test identities.
- [ ] Reassess browser session-token storage and validate authentication/recovery flows.

## MVP foundation — Dashboard and shared tasks/exceptions

**Status: Implemented and deployed · External validation outstanding**

- [x] Build the responsive React + TypeScript + Vite dashboard.
- [x] Add task search, status filters, overdue calculations, and dashboard summary calculations.
- [x] Add email/password authentication and workspace membership loading.
- [x] Connect task and exception reads/status updates to workspace-scoped Supabase tables.
- [x] Add RLS policies for workspace membership and role-based access.
- [x] Enforce viewer read-only controls in the interface and database policies.
- [x] Verify returned task/exception mutation rows before updating local UI state.
- [x] Add regression tests for empty, malformed, mismatched, and multi-row mutation responses.
- [x] Configure GitHub Actions CI and GitHub Pages deployment for the `/opsflow/` path.
- [ ] Verify shared updates with two separate accounts and browser sessions.
- [ ] Verify workspace isolation and viewer restrictions with direct hosted API requests.
- [ ] Verify anonymous access is denied in the configured hosted project.
- [ ] Smoke-test desktop/mobile layouts, keyboard focus, loading, empty, and error states.

## Phase 3 — Operational data and insights

**Status: Partially planned · Account data foundation is the next step**

- [ ] Persist account records and account health in the shared database.
- [ ] Move operational activity history into auditable shared records.
- [ ] Add richer task filtering, sorting, and date-based views.
- [ ] Define KPI formulas, data sources, targets, and calculation windows.
- [ ] Replace sample-based KPI reporting only when source data is verified.
- [ ] Add historical operational trends and comparisons.
- [ ] Make operational rules configurable.
- [ ] Improve exception prioritization, assignment, and resolution workflows.
- [ ] Add useful audit history for shared changes.

## Phase 4 — APIs and integrations

**Status: Future direction**

- [ ] Introduce a documented integration layer for external systems.
- [ ] Explore CRM and customer-data integrations.
- [ ] Synchronize selected operational records with idempotent, auditable jobs.
- [ ] Add robust loading, retry, rate-limit, and API error handling.
- [ ] Explore webhook-based events and secure inbound verification.

## Phase 5 — Workflow automation

**Status: Future direction**

- [ ] Define explicit triggers, conditions, and actions.
- [ ] Automate repetitive operational follow-ups.
- [ ] Add exception alerts and escalation rules.
- [ ] Explore Power Automate and Python-based automation.
- [ ] Add safeguards, auditability, idempotency, and human review where appropriate.

## Phase 6 — Business intelligence

**Status: Future direction**

- [ ] Build historical KPI reporting and trend analysis from verified records.
- [ ] Add richer visualizations and operational reports.
- [ ] Explore Power BI and executive reporting.
- [ ] Connect reports only to verified, shared operational data.

---

## Product direction

OpsFlow should move progressively from **showing what is happening** to identifying **what needs attention, who owns the next step, and what can safely be improved or automated**.

The current release is a deployed portfolio MVP. Future development should be driven by verified operational needs rather than adding complexity for its own sake.

## Guiding principle

> **Start with the data. Turn it into information. Turn information into action.**

Build in small steps, verify each milestone, and introduce complexity only when it solves a real operational problem.

---

Review date: 2026-11-25
