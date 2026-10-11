# Changelog

Notable changes to OpsFlow are recorded here. Entries describe completed work separately from planned or in-progress work.

---

## [Unreleased] — Operational data model planning

### Defined

- Selected **general business operations** as the initial product focus.
- Identified five core domain concepts: accounts, tasks, activities, KPIs, and operational exceptions.
- Planned typed statuses, priorities, severity levels, dates, ownership, identifiers, and optional relationships between records.
- Established the next implementation step: create and verify the TypeScript model before adding sample records or dashboard UI.

### Current position

The project is paused at **Phase 1, Step 2A**. The conceptual model has been designed, but the implementation file `src/types.ts` has not yet been confirmed in the GitHub repository. Sample data, KPI calculations, exception rules, and the OpsFlow dashboard are not yet implemented.

---

## [0.1.0] — Application foundation

### Completed

- Created the OpsFlow GitHub repository.
- Scaffolded a React + TypeScript + Vite application.
- Installed dependencies and started the development server.
- Confirmed the local application preview worked.
- Ran `npm run build` successfully for the initial application foundation.
- Preserved the project roadmap and changelog.
- Committed and pushed the foundation to the `main` branch.
- Selected Oxlint during setup.

### Project direction

OpsFlow is a hands-on learning project focused on general business operations, structured operational data, KPI reporting, task visibility, and exception identification.

The development method is:

**Learn → Build → Test → Understand → Improve → Repeat**

### Next

Resume Phase 1, Step 2A by creating `src/types.ts`, then run the production build to validate the model before proceeding to sample data and relationships.
