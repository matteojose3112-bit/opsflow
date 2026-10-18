# Changelog

Notable changes to OpsFlow are recorded here. Entries distinguish implemented work from checks that still need to be performed in the development environment.

---

## [Unreleased] — Persistent operations workflows

### Added

- Added browser-local persistence for task and exception statuses, with safe fallback to sample data when storage is unavailable or invalid.
- Added editable task status controls and exception triage status controls.
- Added a reset action to restore the original sample workspace.

### Validation status

Automated build/lint and desktop/mobile behavior checks are still pending for this change. Data is stored only in the current browser; shared storage and live integrations remain future work.

---

## [0.2.0] — Functional dashboard milestone

### Added

- Added typed domain models for accounts, tasks, activities, KPIs, and operational exceptions.
- Added linked sample records for the five core concepts.
- Implemented task status and priority counts, overdue-task detection, KPI target comparisons, and operational summary calculations.
- Replaced the Vite starter interface with a responsive dark operations dashboard.
- Added summary metrics, task search and status filters, account health, recent activity, KPI performance, and severity-ranked exceptions.
- Preserved the Aster-inspired cursor dot/ring and magnetic hover effects.
- Updated README and roadmap to match the implementation.

### Validation status

The dashboard is deployed on GitHub Pages. CI build/lint and desktop/mobile behavior checks should be confirmed for the persistent-workflows update. The dashboard still starts from sample data and does not connect to a database or external services.

---

## [0.1.0] — Application foundation

### Completed

- Created the OpsFlow GitHub repository.
- Scaffolded a React + TypeScript + Vite application.
- Installed dependencies and started the development server.
- Confirmed the initial application preview worked.
- Ran `npm run build` successfully for the initial application foundation.
- Preserved the project roadmap and changelog.
- Committed and pushed the foundation to the `main` branch.
- Selected Oxlint during setup.

### Project direction

OpsFlow is a hands-on learning project focused on general business operations, structured operational data, KPI reporting, task visibility, and exception identification.

The development method is:

**Learn → Build → Test → Understand → Improve → Repeat**

### Next

Run the production build and lint checks for the functional dashboard, review the responsive UI, validate key calculations, and merge the feature branch after review.
