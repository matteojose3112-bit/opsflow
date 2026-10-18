# Changelog

Notable changes to OpsFlow are recorded here. Entries distinguish implemented work from checks that still need to be performed.

---

## [Unreleased] — Shared workspace and deployment reliability

### Added

- Added Supabase/PostgreSQL storage for workspace-scoped tasks and operational exceptions, with workspace membership and row-level security.
- Added email/password sign-in, sign-up, sign-out, and authenticated workspace loading.
- Connected task and exception reads and status updates to Supabase.
- Passed the public Supabase URL and publishable key into the GitHub Pages Vite build through GitHub Actions repository variables.
- Documented Supabase setup and frontend credential safety in `docs/shared-storage.md`.
- Corrected the GitHub Pages entry-script path in `index.html`: the root-absolute `/src/main.tsx` path incorrectly targeted the domain root, while OpsFlow is hosted under `/opsflow/`. The entry now uses a relative path so Vite can bundle and serve the app correctly for the project subpath.
- Updated the README and roadmap with the deployment-path correction and current project status.

### Known limitations and follow-up

- Verify shared task/exception updates and workspace isolation using two separate accounts and browser sessions.
- Account, KPI, and activity panels still use sample data; only tasks and operational exceptions currently use shared Supabase storage.
- Add a safe, explicit, previewable import flow if users need to move previous browser-local demo edits into a shared workspace.
- Richer filtering, sorting, and date-based trend analysis remain planned.

### Validation status

The path error was reproduced from the reported failing URL and traced to the script reference in `index.html`. The fix is committed to `main`; confirm the latest GitHub Actions CI and Pages deployment runs complete successfully, then smoke-test the live site.

---

## [0.2.0] — Functional dashboard milestone

### Added

- Added typed domain models for accounts, tasks, activities, KPIs, and operational exceptions.
- Added linked sample records for the five core concepts.
- Implemented task status and priority counts, overdue-task detection, KPI target comparisons, and operational summary calculations.
- Replaced the Vite starter interface with a responsive dark operations dashboard.
- Added summary metrics, task search and status filters, account health, recent activity, KPI performance, and severity-ranked exceptions.
- Preserved the Aster-inspired cursor dot/ring and magnetic hover effects.
- Added browser-local persistence for task and exception statuses, including a reset action for the sample workspace.
- Updated README and roadmap to match the implemented dashboard.

### Validation status

The dashboard is published on GitHub Pages. Shared task and exception storage has since been implemented; cross-user validation remains outstanding.

---

## [0.1.0] — Application foundation

### Completed

- Created the OpsFlow GitHub repository.
- Scaffolded a React + TypeScript + Vite application.
- Installed dependencies and started the development server.
- Confirmed the initial application preview worked.
- Ran `npm run build` successfully for the initial application foundation.
- Preserved the project roadmap and changelog.
- Selected Oxlint during setup.
- Committed and pushed the foundation to the `main` branch.

### Project direction

OpsFlow is a hands-on learning project focused on general business operations, structured operational data, KPI reporting, task visibility, and exception identification.

The development method is:

**Learn → Build → Test → Understand → Improve → Repeat**

### Next

Build and lint the functional dashboard, review the responsive UI, validate key calculations, and verify shared workspace behavior across separate accounts.
