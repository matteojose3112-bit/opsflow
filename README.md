# OpsFlow

**Operational clarity, every day.**

OpsFlow is a focused operations workspace for turning day-to-day business activity into clear priorities. It brings task ownership, deadlines, operational exceptions, account context, and performance indicators into one dashboard.

**Live app:** [Open OpsFlow](https://matteojose3112-bit.github.io/opsflow/)  
**Project approach:** Learn → Build → Test → Understand → Improve → Repeat

## Current status

**Deployed frontend MVP · Maintenance mode · Security remediation and shared-workspace validation outstanding**

The React application is deployed to GitHub Pages. Email/password authentication and Supabase-backed, workspace-scoped task and operational-exception reads and status updates are implemented. The checked-in database migration defines row-level security (RLS) policies, but static inspection identified an ownership-boundary issue tracked in [issue #8](https://github.com/matteojose3112-bit/opsflow/issues/8).

The documentation pull request's CI passed on 2026-11-12. The public unauthenticated sign-in screen was browser-checked. Neither result establishes live multi-user correctness or hosted Supabase security.

## Implemented

- Responsive operations dashboard with task ownership, priorities, due dates, overdue states, search, and status filters.
- Operational exception triage with severity, owner, description, and status updates.
- Summary metrics and KPI comparisons.
- Email/password sign-up, sign-in, sign-out, session refresh, and workspace membership loading.
- Supabase-backed task and exception reads and status updates, scoped by workspace.
- RLS policies for workspace membership, task/exception access, and role-based editing/deletion.
- Viewer-role read-only controls in the interface and database policies.
- Reduced-motion and touch-device handling.
- GitHub Pages deployment configured for the `/opsflow/` project path.
- GitHub Actions CI for TypeScript/production build and Oxlint.

## Data boundaries

OpsFlow combines shared operational records with illustrative dashboard data.

| Area | Current source |
| --- | --- |
| Tasks and task status | Supabase workspace tables |
| Operational exceptions and status | Supabase workspace tables |
| Accounts and account health | Sample data |
| KPIs and performance snapshot | Sample data |
| Recent activity | Sample data |

Sample-based metrics and activity are for demonstration, not live business reporting. The app currently loads the first workspace membership returned for the signed-in user. Workspace switching, real-time subscriptions, account/KPI/activity persistence, and import of previous browser-local demo edits are not implemented.

## Security finding and validation still outstanding

A static review of the checked-in RLS migration found that admins may be able to promote themselves or another member to `owner`, and may be able to change `workspaces.owner_id`. This is tracked in [issue #8](https://github.com/matteojose3112-bit/opsflow). No live authenticated test has been performed, and the hosted Supabase configuration has not been verified.

Remaining checks:
- Correct owner-role assignment and workspace ownership policies, then add regression tests.
- Test shared task and exception updates using two distinct accounts and browser sessions.
- Verify a non-member cannot read or modify another workspace's records.
- Verify viewer-role restrictions against the live Supabase project, including direct API requests.
- Verify anonymous access is denied and inspect the deployed project's RLS configuration.
- Smoke-test the live site on desktop and mobile, including keyboard focus and responsive layouts.
- Verify loading, empty, network-error, and permission-denied behavior.

Until these checks are completed, treat OpsFlow as a deployed portfolio MVP, not a production-validated multi-user operations system. Use sample data only; do not enter real customer, confidential, or sensitive business information.

## Technology

- **React + TypeScript** — interface and typed domain models.
- **Vite** — development server and production build.
- **Oxlint** — code linting.
- **Supabase Auth + PostgreSQL + RLS** — authentication and shared task/exception storage.
- **GitHub Actions + GitHub Pages** — CI, deployment, and hosting.

## Local development

Requirements: Node.js 22 or a compatible supported version, and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` for authenticated workspace functionality. Run the checks before publishing:

```bash
npm run build
npm run lint
```

## Deployment and credential safety

The app is hosted at `https://matteojose3112-bit.github.io/opsflow/`. Vite uses `/opsflow/` as its base path.

Read [docs/shared-storage.md](./docs/shared-storage.md) before configuring Supabase. Only the public project URL and publishable/anon key belong in frontend configuration. **Never put a Supabase service-role key in browser code, `VITE_*` variables, or the repository.** RLS—not secrecy of the public client key—must protect workspace data.

## Project history

See [ROADMAP.md](./ROADMAP.md) for implemented scope and outstanding verification, and [CHANGELOG.md](./CHANGELOG.md) for project history.

## Documentation and validation review — 2026-11-12

The latest PR CI build-and-lint job passed. A live unauthenticated browser smoke check confirmed that the public GitHub Pages URL renders the sign-in screen without visible browser errors or failed assets. This validates the entry route only, not authenticated dashboard behavior.

The repository-only RLS review and its limitations are recorded in [docs/shared-storage.md](./docs/shared-storage.md). It also identified the ownership-policy finding tracked in [issue #8](https://github.com/matteojose3112-bit/opsflow). No application code, migration, hosted Supabase configuration, or deployment was changed in this documentation checkpoint.
