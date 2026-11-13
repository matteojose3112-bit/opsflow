# Shared storage foundation

## Status

The app uses Supabase Auth and workspace-scoped database reads/writes when deployed with the GitHub Actions repository variables. Task and exception status updates are shared; account, KPI, and activity panels remain sample data.

The application implements email/password sign-in, workspace membership loading, and role-aware task/exception status controls. The SQL migration defines the corresponding RLS policies. Live multi-user, cross-workspace, and role-enforcement checks remain outstanding; implementation in the repository is not proof that the configured hosted project is correctly provisioned.

## Why Supabase

OpsFlow is deployed as a static Vite site on GitHub Pages, so it has no private server process in which to safely store database credentials. Supabase provides PostgreSQL, authentication, and row-level security (RLS). The browser may use only the project's public/anonymous client key; RLS is responsible for protecting data. Never expose a service-role key.

## Database model

The migration at `supabase/migrations/202610180001_shared_workspace.sql` creates:

- `workspaces`: an operations workspace and its owner.
- `workspace_members`: which authenticated users can access a workspace, with owner/admin/member/viewer roles.
- `tasks`: task records, constrained to the statuses and priorities already used by OpsFlow.
- `operational_exceptions`: exception records, constrained to existing severity and status values.

Tasks and exceptions are scoped by `workspace_id`. RLS policies limit authenticated users to workspaces where they are members. Owners/admins can manage membership and delete operational records; ordinary members can create and update tasks and exceptions; viewers have read-only access. The interface also disables task/exception status controls for viewers. These rules still need live verification using distinct test accounts and direct API requests.

## Setup

1. Create a Supabase project.
2. Open **SQL Editor** in that project and run the migration file in this repository.
3. In **Authentication → Users**, create or sign up the first user.
4. Copy that user's UUID from the Auth user record.
5. In SQL Editor, create the initial workspace and owner membership by running the two commented statements at the bottom of the migration, replacing the placeholder UUIDs. Use the workspace UUID returned by the first statement in the second.
6. Configure the app with the Supabase project URL and public anon/publishable key. For local development, copy `.env.example` to `.env.local`; do not commit populated environment files.
7. Configure GitHub Actions repository variables for the same public URL and anon/publishable key before deploying the client integration. These values are public client configuration; RLS and authenticated sessions must protect the data.
8. Confirm email/password auth settings and allowed redirect URLs include the GitHub Pages origin: `https://matteojose3112-bit.github.io` and the app path `https://matteojose3112-bit.github.io/opsflow/`.

## Security and rollout rules

- Never use a service-role key in frontend code, `VITE_*` variables, GitHub Pages, or public repository files.
- Do not add public read/write RLS policies to make the dashboard work without authentication.
- Do not automatically upload browser-local demo edits into a shared workspace. A later import flow should preview records and ask for confirmation to avoid overwriting shared data.
- Treat a failed remote read/write as an error; do not silently fall back to local writes while presenting the data as shared.
- The current app signs in with email/password, loads the first workspace membership returned for the authenticated user, reads tasks and exceptions from Supabase, and saves status changes remotely. It does not import the browser's old demo edits. The dashboard's account, KPI, and activity panels remain sample data because those tables are not in this initial schema.
- Session tokens are stored in browser local storage. Treat this as a client-side security trade-off and do not use the app for sensitive production records until the deployment and threat model have been reviewed.

## Static policy review — 2026-11-12

A repository-only review of `supabase/migrations/202610180001_shared_workspace.sql` found:

- RLS is enabled on all four application tables: `workspaces`, `workspace_members`, `tasks`, and `operational_exceptions`.
- The membership/role helper functions use `SECURITY DEFINER`, an empty `search_path`, and schema-qualified table references. Execute permission is revoked from `PUBLIC` and granted to `authenticated`.
- Workspace and operational-record reads are scoped through workspace membership.
- Task and exception inserts/updates require an owner, admin, or member role; viewer is excluded. Deletes are restricted to admin/owner roles.
- The migration does not define anonymous-role access policies for these tables.

This is a static review of the checked-in SQL only. It does **not** confirm that the migration has been applied to the hosted Supabase project, that deployed policies match this file, or that runtime requests are denied/allowed as intended. The public website's unauthenticated sign-in screen was browser-checked, but no authenticated credentials or live database access were used.

The application stores session tokens in browser local storage, as noted above. Keep this client-side trade-off in scope for any future production threat-model review.

## Validation checklist

- [x] Add SQL migration for workspace and operational tables with RLS policies.
- [ ] Verify anonymous requests cannot read or modify workspace data.
- [ ] Verify a workspace member can read and update that workspace's tasks/exceptions.
- [ ] Verify a non-member cannot access another workspace's records.
- [ ] Verify viewer role is read-only in the app and through direct API requests.
- [x] Connect authenticated app reads/writes for task and exception status.
- [ ] Verify shared updates in two browser sessions.
- [ ] Confirm the configured hosted Supabase project has the expected migration and policies.
