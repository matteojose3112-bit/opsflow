# Changelog

Notable OpsFlow changes. Completed implementation and pending validation are recorded separately.

---

## [0.3.0] — MVP Closeout & Maintenance Mode

### Clarified
- Defined the current release as a deployed frontend MVP with Supabase-backed authentication and workspace-scoped task/exception integration.
- Documented that account health, KPIs, and recent activity remain illustrative sample data.
- Documented that workspace switching, real-time subscriptions, account/KPI/activity persistence, and demo-data import are not implemented.
- Distinguished successful CI and Pages deployment from uncompleted live multi-user and security validation.
- Set the project to maintenance mode pending external validation rather than implying production readiness.

### Validation still required
- Test shared task and exception updates with two distinct accounts and browser sessions.
- Verify cross-workspace isolation, viewer restrictions, and anonymous access denial against the live Supabase project.
- Smoke-test responsive layouts, keyboard focus, and recoverable error states.
- Confirm the configured live project has the intended RLS policies and redirect settings.

### Existing implementation
- Email/password authentication and session refresh.
- Workspace membership loading and role-aware UI controls.
- Supabase-backed task and operational-exception reads and status updates.
- PostgreSQL schema and RLS policies for workspaces, members, tasks, and exceptions.
- GitHub Actions CI and GitHub Pages deployment.

---

## [Unreleased] — Visual polish and reliability

### Improved
- Added a subtle, layered dark background with soft violet/blue ambient gradients to give the workspace more depth while keeping the data panels readable.
- Refined panel surfaces, borders, shadows, and the sticky top bar for a more cohesive finish.
- Aligned cursor and magnetic interactions with Aster: hover feedback remains available on interactive controls, while only explicitly marked elements move magnetically.
- Disabled magnetic movement when reduced motion is preferred and kept custom cursor effects off touch/coarse-pointer devices.
- Updated dashboard copy to make the shared workspace clearer and avoid presenting a sample trend as a verified week-over-week result.
- Improved the page title, description, and Open Graph metadata.
- Rewrote the README and roadmap to distinguish implemented functionality from outstanding verification.

### Validation still required
- Smoke-test the live GitHub Pages deployment and responsive layouts.
- Verify task/exception updates across two separate accounts and browser sessions.
- Confirm workspace isolation and viewer-role restrictions.
- Account health, KPIs, and recent activity remain sample data; shared storage currently covers tasks and operational exceptions.

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
- Connected task and exception reads and status updates to Supabase.
- Added GitHub Actions build configuration for the public Supabase URL and publishable key.
- Corrected the GitHub Pages entry-script path so the application loads from the `/opsflow/` project URL.
- Added Aster-inspired cursor and magnetic interactions.

### Validation status
The dashboard is deployed. Cross-user shared updates, workspace isolation, and the latest production build still require verification.

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
