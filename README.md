# OpsFlow

**Operational clarity, every day.**

OpsFlow is a focused operations workspace for turning day-to-day business activity into clear priorities. It brings task ownership, deadlines, operational exceptions, account context, and performance indicators into one dashboard.

**Live app:** [Open OpsFlow](https://matteojose3112-bit.github.io/opsflow/)  
**Project approach:** Learn → Build → Test → Understand → Improve → Repeat

## Current status

**Deployed frontend MVP · Security hardening in progress · Production validation outstanding**

The React application is deployed to GitHub Pages. Email/password authentication and Supabase-backed, workspace-scoped task and operational-exception reads and status updates are implemented. A separate security branch now contains an additive RLS hardening migration and SQL regression tests for workspace ownership boundaries. These changes have not been applied to the hosted Supabase project, and the database tests have not yet been executed.

The previously recorded GitHub Actions CI and Pages deployment runs succeeded on earlier revisions. That evidence does not validate the new SQL migration, live multi-user correctness, or production security.

## Implemented

- Responsive operations dashboard with task ownership, priorities, due dates, overdue states, search, and status filters.
- Operational exception triage with severity, owner, description, and status updates.
- Summary metrics and KPI comparisons.
- Email/password sign-up, sign-in, sign-out, session refresh, and workspace membership loading.
- Supabase-backed task and exception reads and status updates, scoped by workspace.
- Existing RLS policies for workspace membership, task/exception access, and role-based editing/deletion.
- Viewer-role read-only controls in the interface and database policies.
- Reduced-motion and touch-device handling.
- GitHub Pages deployment configured for the `/opsflow/` project path.
- GitHub Actions CI for TypeScript/production build and Oxlint.

## Security hardening branch

The branch `fix/workspace-ownership-authorization` adds:

- An additive migration that restricts ordinary workspace metadata updates to the current owner without allowing `owner_id` changes.
- Membership insert/update/delete policies that prevent generic CRUD operations from creating, promoting, or removing the owner membership.
- A dedicated `transfer_workspace_ownership(workspace_id, new_owner_id)` database function. Only the current owner can use it; the new owner must already be a workspace member, and the former owner becomes an admin.
- pgTAP regression coverage for admin self-promotion, admin promotion of another member, direct owner-id changes, permitted admin membership management, explicit ownership transfer, viewer restrictions, and non-member isolation.

This is code-level remediation only. Apply and test it against a disposable Supabase database before considering any hosted rollout. See [docs/shared-storage.md](./docs/shared-storage.md).

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

- Run `supabase test db` against a disposable local/test Supabase database with all migrations applied.
- Review the ownership migration and pgTAP tests, then verify the behavior with authenticated owner/admin/member/viewer identities.
- Verify a non-member cannot read or modify another workspace's records.
- Verify anonymous access is denied and inspect the deployed project's RLS configuration.
- Test shared task and exception updates using two distinct accounts and browser sessions.
- Smoke-test the live site on desktop and mobile, including keyboard focus, loading, empty, network-error, and permission-denied states.

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

To run database regression tests, install the Supabase CLI, start a disposable local Supabase stack, apply migrations, and run:

```bash
supabase test db
```

## Deployment and credential safety

The app is hosted at `https://matteojose3112-bit.github.io/opsflow/`. Vite uses `/opsflow/` as its base path.

Read [docs/shared-storage.md](./docs/shared-storage.md) before configuring Supabase. Only the public project URL and publishable/anon key belong in frontend configuration. **Never put a Supabase service-role key in browser code, `VITE_*` variables, or the repository.** RLS—not secrecy of the public client key—must protect workspace data.

## Project history

See [ROADMAP.md](./ROADMAP.md) for implemented scope and outstanding verification, and [CHANGELOG.md](./CHANGELOG.md) for project history.
