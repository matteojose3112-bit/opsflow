# Changelog

Notable OpsFlow changes. Completed implementation and pending validation are recorded separately.

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
- Run the current production build and lint checks.
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
