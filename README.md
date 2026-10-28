# OpsFlow

**Operational clarity, every day.**

OpsFlow is a focused operations workspace for turning day-to-day business activity into clear priorities. It brings task ownership, deadlines, operational exceptions, account context, and performance indicators into one dashboard.

**Live app:** [Open OpsFlow](https://matteojose3112-bit.github.io/opsflow/)  
**Project approach:** Learn → Build → Test → Understand → Improve → Repeat

## Current status

The dashboard is deployed to GitHub Pages. Email/password authentication and shared workspace storage are implemented for tasks and operational exceptions using Supabase and PostgreSQL. Cross-user collaboration and workspace isolation still need validation with separate accounts and browser sessions.

### Implemented

- Responsive operations dashboard with a refined dark interface and subtle atmospheric background.
- Task overview with owner, priority, due date, overdue state, search, status filters, and editable status.
- Operational exception triage with severity, owner, description, and status updates.
- Summary metrics for active tasks, overdue work, open exceptions, and tracked accounts.
- KPI snapshot with target comparisons and direction-aware calculations.
- Account health and recent activity panels.
- Email/password sign-up, sign-in, sign-out, and workspace membership loading.
- Supabase-backed task and exception reads and status updates, with workspace-level access policies.
- Aster-inspired cursor ring and explicitly targeted magnetic interactions on supported desktop pointers.
- Reduced-motion and touch-device handling.
- GitHub Pages deployment configured for the `/opsflow/` project path.

## Data boundaries

OpsFlow currently combines shared operational records with clearly illustrative dashboard data.

| Area | Current source |
| --- | --- |
| Tasks and task status | Shared Supabase workspace |
| Operational exceptions and status | Shared Supabase workspace |
| Accounts and account health | Sample data |
| KPIs and activity feed | Sample data |

Metrics and activity based on sample records are for demonstration, not live business reporting. The dashboard does not yet provide real-time subscriptions, cross-session verification, or an import path for previous browser-local demo edits.

## Roadmap

### Next — Reliability and workspace validation
- [ ] Verify shared task and exception updates across two separate accounts and browser sessions.
- [ ] Confirm workspace isolation and viewer-role restrictions.
- [ ] Validate production build, lint, and GitHub Pages deployment.
- [ ] Smoke-test responsive layouts, focus states, and status updates.
- [ ] Add clear loading, empty, and recoverable error states where needed.

### Then — More useful operations
- [ ] Add richer task search, filtering, sorting, and date-based views.
- [ ] Add a safe, previewable import flow for demo data when needed.
- [ ] Move account and activity records to the shared database.
- [ ] Add operational trends and configurable KPI targets.
- [ ] Improve exception prioritization and ownership workflows.

### Later — Integrations and intelligence
- [ ] Connect CRM and other business systems through documented APIs.
- [ ] Explore event-driven workflows, alerts, and automation.
- [ ] Add historical reporting, trends, and business intelligence views.

See [ROADMAP.md](./ROADMAP.md) for the full plan and [CHANGELOG.md](./CHANGELOG.md) for project history.

## Technology

- **React** and **TypeScript** — interface and typed domain models.
- **Vite** — development server and production build.
- **Oxlint** — code linting.
- **Supabase / PostgreSQL** — authentication and shared task/exception storage.
- **GitHub Actions / GitHub Pages** — deployment and hosting.

## Local development

Requirements: a compatible Node.js version and npm.

```bash
npm install
npm run dev
```

Before publishing, run:

```bash
npm run build
npm run lint
```

## Deployment notes

The app is hosted at `https://matteojose3112-bit.github.io/opsflow/`. Vite uses `/opsflow/` as its base path, and `index.html` uses a relative module entry so production assets resolve under the GitHub Pages project URL.

Read [docs/shared-storage.md](./docs/shared-storage.md) before configuring Supabase. Only the public project URL and publishable/anon key belong in frontend configuration. **Never put a Supabase service-role key in browser code or commit it to the repository.**

## Why this project exists

OpsFlow is both a practical business-operations product and a structured software-learning project. It is built in small increments, with a preference for understanding the data and business rules before adding more complexity.
