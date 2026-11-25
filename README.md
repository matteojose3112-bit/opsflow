# OpsFlow

**Operational clarity, every day.**

OpsFlow is a multi-workspace operations dashboard for turning day-to-day business activity into clear priorities. It brings task ownership, deadlines, operational exceptions, account context, and performance indicators into one interface.

**Live app:** [Open OpsFlow](https://matteojose3112-bit.github.io/opsflow/)  
**Project approach:** Learn → Build → Test → Understand → Improve → Repeat

## Current status

**Deployed portfolio MVP · Multi-workspace controls merged · Account schema and RLS implemented on a feature branch · Production validation outstanding**

The React + TypeScript application is deployed to GitHub Pages. Supabase Auth provides email/password authentication, and workspace-scoped task and operational-exception reads and status updates use PostgreSQL row-level security (RLS). Signed-in users can switch between workspaces they belong to; the selector displays their role and reloads the selected workspace's tasks and exceptions.

The ownership-hardening and multi-workspace changes are merged to `main`. CI, disposable local Supabase migration/pgTAP tests, and GitHub Pages deployment passed after the latest merge. The multi-workspace regression suite includes 36 pgTAP assertions. These automated checks do not replace live validation against separate hosted test identities.

## Implemented

- Responsive operations dashboard with task ownership, priorities, due dates, overdue states, search, and status filters.
- Operational exception triage with severity, owner, description, and status updates.
- Email/password sign-up, sign-in, sign-out, session refresh, and workspace membership loading.
- Multi-workspace selector populated from the authenticated user's accessible memberships, with the user's role displayed.
- Workspace-scoped task and exception reloads when switching workspaces, with a visible error state on failure.
- Supabase-backed task and exception reads and status updates, scoped by workspace.
- Confirmed status writes: the client verifies the returned record ID and persisted status before updating dashboard state.
- Workspace ownership protections and an owner-only atomic `transfer_workspace_ownership` operation.
- RLS policies for workspace membership, task/exception access, and role-based editing/deletion.
- Viewer-role read-only restrictions enforced in the interface and database policies.
- Regression tests for malformed and mismatched mutation responses, cross-workspace access, and viewer write denial.
- Disposable local Supabase configuration and GitHub Actions database security workflow.
- Reduced-motion and touch-device handling.
- GitHub Actions CI and GitHub Pages deployment configured for the `/opsflow/` project path.

## Data boundaries

OpsFlow currently combines shared operational records with illustrative dashboard data. The account schema, policies, and typed dashboard reads are implemented on the open account-foundation PR. The live site remains unchanged until the migration is separately applied to hosted Supabase and the code is merged and deployed.

| Area | Current source |
| --- | --- |
| Workspaces and memberships | Supabase |
| Tasks and task status | Supabase workspace tables |
| Operational exceptions and status | Supabase workspace tables |
| Accounts schema and permissions | Supabase migration on feature branch; not yet deployed |
| Account cards and account health in dashboard | Illustrative sample data |
| KPIs and performance snapshot | Illustrative sample data |
| Recent activity | Illustrative sample data |

The feature branch now loads account cards, health indicators, task account names, and account counts from the workspace-scoped table. The deployed site still uses the previous release until the migration is applied to hosted Supabase and this branch is released. KPI summaries that depend on sample accounts or sample metrics are not live business reporting. Real-time subscriptions, shared account/activity persistence, and import of previous browser-local demo edits are not implemented.

## Next milestone: account management workflows

The database foundation is implemented on PR #15 (`feat/workspace-scoped-accounts`):

- Workspace-scoped `accounts` table with name, industry, owner, health, and timestamps.
- RLS: members can read/create/update; owners and admins can delete; viewers are read-only; non-members are isolated.
- Composite workspace/account foreign keys prevent new task and exception references from crossing workspace boundaries.
- Legacy demo references are preserved by adding the foreign keys as `NOT VALID`; new writes are still checked.
- 18 pgTAP assertions cover roles, isolation, cross-workspace references, and delete behavior.

The current PR also adds typed account loading in `AuthApp`, passes shared account records into the dashboard, replaces sample account lookups/cards, and handles account-load errors and empty workspaces. Next, add safe account create/edit flows, then rerun CI and disposable Supabase tests on the final exact PR head. Hosted Supabase has not been changed.

## Validation still outstanding

- Test workspace switching and shared task/exception updates using distinct accounts and browser sessions.
- Verify non-members cannot read or modify another workspace's records through direct API requests.
- Verify viewer restrictions and anonymous access denial against the hosted Supabase project.
- Smoke-test the live site on desktop and mobile, including keyboard focus, responsive layouts, and error states.
- Review the browser session-token storage threat model and authentication/recovery flows.

Until these checks are completed, treat OpsFlow as a deployed portfolio MVP, not a production-validated multi-user operations system. Use sample data only; do not enter real customer, confidential, or sensitive business information.

## Technology

- **React + TypeScript** — interface and typed domain models.
- **Vite** — development server and production build.
- **Oxlint** — code linting.
- **Supabase Auth + PostgreSQL + RLS** — authentication and shared task/exception storage.
- **GitHub Actions + GitHub Pages** — CI, database regression testing, deployment, and hosting.

## Local development

Requirements: Node.js 22 or a compatible supported version, and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` for authenticated workspace functionality. Run the application checks before proposing a change:

```bash
npm run build
npm test
npm run lint
```

For database regression tests, install Docker and the Supabase CLI, then run `supabase start`, `supabase test db`, and `supabase stop --no-backup`. Use only a disposable local/test database.

## Deployment and credential safety

The app is hosted at [matteojose3112-bit.github.io/opsflow](https://matteojose3112-bit.github.io/opsflow/). Vite uses `/opsflow/` as its base path.

Read [docs/shared-storage.md](./docs/shared-storage.md) before configuring Supabase. Only the public project URL and publishable/anon key belong in frontend configuration. **Never put a Supabase service-role key in browser code, `VITE_*` variables, or the repository.** RLS—not secrecy of the public client key—must protect workspace data.

Hosted Supabase changes require separate explicit authorization. CI database tests use a disposable local Supabase stack.

## Project history

See [ROADMAP.md](./ROADMAP.md) for implemented scope and upcoming work, and [CHANGELOG.md](./CHANGELOG.md) for release history.
