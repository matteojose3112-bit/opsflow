# Shared storage foundation

## Status

This milestone adds the database schema and secure access policies for shared OpsFlow workspaces. The app uses Supabase Auth and workspace-scoped database reads/writes when deployed with the GitHub Actions repository variables. Do not treat this foundation as live shared storage yet.

## Why Supabase

OpsFlow is deployed as a static Vite site on GitHub Pages, so it has no private server process in which to safely store database credentials. Supabase provides PostgreSQL, authentication, and row-level security (RLS). The browser may use only the project's public/anonymous client key; RLS is responsible for protecting data. Never expose a service-role key.

## Database model

The migration at `supabase/migrations/202610180001_shared_workspace.sql` creates:

- `workspaces`: an operations workspace and its owner.
- `workspace_members`: which authenticated users can access a workspace, with owner/admin/member/viewer roles.
- `tasks`: task records, constrained to the statuses and priorities already used by OpsFlow.
- `operational_exceptions`: exception records, constrained to existing severity and status values.

Tasks and exceptions are scoped by `workspace_id`. Row-level security prevents unauthenticated access and limits authenticated users to workspaces where they are members. Owners/admins can manage membership and delete operational records; ordinary members can read and update tasks and exceptions. The UI must still enforce viewer read-only behavior when the role is integrated.

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
- The current app signs in with email/password, loads the first workspace membership for the authenticated user, reads tasks and exceptions from Supabase, and saves status changes remotely. It does not import the browser's old demo edits. The dashboard's account, KPI, and activity panels remain sample data because those tables are not in this initial schema.

## Validation checklist

- [x] Apply migration to the configured Supabase project.
- [ ] Verify anonymous requests cannot read or modify workspace data.
- [ ] Verify a workspace member can read and update that workspace's tasks/exceptions.
- [ ] Verify a non-member cannot access another workspace's records.
- [ ] Verify viewer role is read-only in the app.
- [x] Connect authenticated app reads/writes for task and exception status.
- [ ] Verify shared updates in two browser sessions.
