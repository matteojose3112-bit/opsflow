# OpsFlow

**Operational clarity, every day.**

OpsFlow is a focused operations workspace for turning day-to-day business activity into clear priorities. It brings task ownership, deadlines, operational exceptions, account context, and performance indicators into one dashboard.

**Live app:** [Open OpsFlow](https://matteojose3112-bit.github.io/opsflow/)  
**Project approach:** Learn → Build → Test → Understand → Improve → Repeat

## Current status

**Deployed frontend MVP · Ownership security hardening under review · Production validation outstanding**

The React application is deployed to GitHub Pages. Email/password authentication and Supabase-backed, workspace-scoped task and operational-exception reads and status updates are implemented. Database row-level security (RLS) policies define member, editor, and admin access.

The task/exception mutation reliability checks now run in CI and confirm server-returned IDs and persisted statuses before updating the interface. A separate ownership-hardening change is under review; local Supabase database tests are still running and hosted multi-user correctness remains unverified.

## Implemented

- Responsive operations dashboard with task ownership, priorities, due dates, overdue states, search, and status filters.
- Operational exception triage with severity, owner, description, and status updates.
- Summary metrics and KPI comparisons.
- Email/password sign-up, sign-in, sign-out, session refresh, and workspace membership loading.
- Supabase-backed task and exception reads and status updates, scoped by workspace.
- Confirmed status writes: PATCH requests return the affected row representation, and the client verifies the expected record ID and persisted status before updating the dashboard state.
- Dependency-free Node.js regression tests for empty, malformed, mismatched, and multi-row mutation responses.
- RLS policies for workspace membership, task/exception access, and role-based editing/deletion.
- Viewer-role read-only controls in the interface and database policies.
- Reduced-motion and touch-device handling.
- GitHub Pages deployment configured for the `/opsflow/` project path.
- GitHub Actions CI for TypeScript/production build, Oxlint, and reliability unit tests.

## Workspace ownership hardening

A separate change adds an additive RLS migration that prevents generic updates to `workspaces.owner_id`, limits membership updates to role changes, protects the owner membership, and provides an owner-only `transfer_workspace_ownership` function. Ownership transfer requires an existing workspace member and demotes the former owner to admin. pgTAP coverage and a disposable local Supabase workflow are included; CI validation is pending. The migration has not been applied to hosted Supabase.

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

## Validation still outstanding

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
npm test
npm run lint
```

## Deployment and credential safety

The app is hosted at `https://matteojose3112-bit.github.io/opsflow/`. Vite uses `/opsflow/` as its base path.

Read [docs/shared-storage.md](./docs/shared-storage.md) before configuring Supabase. Only the public project URL and publishable/anon key belong in frontend configuration. **Never put a Supabase service-role key in browser code, `VITE_*` variables, or the repository.** RLS—not secrecy of the public client key—must protect workspace data.

To run database regression tests locally, install Docker and the Supabase CLI, then run `supabase start`, `supabase test db`, and `supabase stop --no-backup`. Use only a disposable local/test database.

## Project history

See [ROADMAP.md](./ROADMAP.md) for implemented scope and outstanding verification, and [CHANGELOG.md](./CHANGELOG.md) for project history.

## Documentation review — 2026-11-03

Documentation review — 2026-11-03: OpsFlow remains a deployed portfolio MVP in maintenance mode. Authentication and workspace-scoped task/exception reads and status updates are implemented through Supabase, with RLS policies documented. Accounts, KPIs, and recent activity remain sample data. Multi-account isolation, viewer permissions, anonymous denial, and live responsive/accessibility checks still require external validation.
