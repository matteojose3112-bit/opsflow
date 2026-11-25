# Changelog

Notable OpsFlow changes. Completed implementation and pending validation are recorded separately.

---

## [Unreleased] — Workspace-scoped account data foundation

### Added
- Added an additive `accounts` table keyed by workspace and account ID, with industry, owner, health, and timestamps.
- Added workspace-scoped RLS policies: members can read/create/update accounts; owners/admins can delete; viewers are read-only; non-members cannot access records.
- Added composite workspace/account foreign keys for tasks and operational exceptions to prevent new cross-workspace references.
- Preserved existing demo references with `NOT VALID` constraints while enforcing new writes.
- Added 18 pgTAP assertions covering account access by role, workspace isolation, cross-workspace references, and account deletion behavior.

### Validation
- CI passed on commit `15eb0afd`.
- Disposable local Supabase migration and pgTAP workflow passed on commit `15eb0afd` (18 account assertions; 54 total database assertions including the existing workspace-ownership suite).
- Dashboard account loading is not included yet; account cards still use illustrative sample data.
- PR #15 remains open and unmerged. No hosted Supabase schema or data has been changed.

---

## [0.5.0] — Multi-workspace access controls — 2026-11-25

### Added
- Added a workspace selector populated from the signed-in user's accessible memberships, displaying the user's role for each workspace.
- Added workspace-scoped task and operational-exception reloads when switching workspaces.
- Added visible workspace-switch error handling that preserves the previously active workspace when loading fails.
- Expanded disposable local Supabase pgTAP coverage to 36 assertions, including two-workspace isolation, cross-workspace read/update denial, multi-workspace membership visibility, and viewer write denial.

### Validation
- CI passed on the reviewed PR commit.
- Disposable local Supabase migration and pgTAP workflow passed on the reviewed PR commit.
- Post-merge CI and database security workflow passed on merge commit `b0912a6`.
- GitHub Pages deployment completed successfully on merge commit `b0912a6`.
- Hosted Supabase was not modified. Live validation with separate hosted test identities remains outstanding.

---

## [0.4.0] — Workspace ownership security hardening

### Added
- Added an additive migration to restrict generic workspace ownership changes and membership identity mutations.
- Added an owner-only atomic ownership-transfer function that requires an existing workspace member and demotes the former owner to admin.
- Added pgTAP regression coverage for protected owner membership, ordinary member removal, ownership transfer, viewer restrictions, and non-member isolation.
- Added a disposable local Supabase configuration and dedicated GitHub Actions database-test workflow.

### Validation
- CI and disposable local Supabase migration/pgTAP tests passed before merge.
- Changes merged to `main`; hosted Supabase behavior remains unverified and no hosted database was changed.

---

## [0.3.0] — MVP closeout and shared task/exception integration

### Added
- Added email/password authentication and session refresh.
- Added workspace membership loading and role-aware interface controls.
- Added Supabase-backed, workspace-scoped task and operational-exception reads and status updates.
- Added PostgreSQL schema and RLS policies for workspaces, members, tasks, and exceptions.
- Added GitHub Actions CI and GitHub Pages deployment.

### Improved
- Task and exception status updates now verify the returned record ID and persisted status before updating dashboard state.
- Added regression tests for empty, malformed, mismatched, and multi-row mutation responses.
- Improved responsive styling, reduced-motion handling, touch-device behavior, and deployment path configuration.

### Data boundaries
- Account health, KPIs, and recent activity remain illustrative sample data.
- The app is a deployed portfolio MVP, not a production-validated multi-user operations system.

---

## [0.2.0] — Functional dashboard milestone

### Added
- Added typed domain models for accounts, tasks, activities, KPIs, and operational exceptions.
- Added linked sample records and business calculations for task status, overdue work, KPI targets, and dashboard summaries.
- Replaced the Vite starter interface with a responsive operations dashboard.
- Added summary metrics, task search and status filters, account health, recent activity, KPI performance, and severity-ranked exceptions.
- Added browser-local persistence for task and exception status changes, including a reset action for the sample workspace.
- Added Supabase/PostgreSQL storage for workspace-scoped tasks and operational exceptions, with workspace membership and row-level security.
- Added email/password sign-up, sign-in, sign-out, and authenticated workspace loading.
- Added GitHub Actions build configuration for the public Supabase URL and publishable key.
- Added Aster-inspired cursor and magnetic interactions.

### Validation
- Dashboard deployed to GitHub Pages.
- Cross-user shared updates, workspace isolation, and live security validation remain separate verification tasks.

---

## [0.1.0] — Application foundation

### Completed
- Created the OpsFlow GitHub repository.
- Scaffolded the React + TypeScript + Vite application.
- Installed dependencies and confirmed the initial application preview worked.
- Added the initial project roadmap and changelog.
- Selected Oxlint during setup.
- Committed and pushed the foundation to the `main` branch.

### Project direction
OpsFlow is a practical learning project focused on business operations, structured data, KPI reporting, task visibility, and exception handling.

**Learn → Build → Test → Understand → Improve → Repeat**
