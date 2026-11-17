# Shared storage foundation

## Status

The app uses Supabase Auth and workspace-scoped database reads/writes when deployed with the GitHub Actions repository variables. Task and exception status updates are shared; account, KPI, and activity panels remain sample data.

The application implements email/password sign-in, workspace membership loading, and role-aware task/exception status controls. The initial RLS migration is supplemented on branch `fix/workspace-ownership-authorization` by an additive ownership-hardening migration and pgTAP regression tests. Neither has been applied to the hosted Supabase project, and the regression suite has not yet been executed. Repository implementation is not proof that the configured hosted project is correctly provisioned.

## Why Supabase

OpsFlow is deployed as a static Vite site on GitHub Pages, so it has no private server process in which to safely store database credentials. Supabase provides PostgreSQL, authentication, and row-level security (RLS). The browser may use only the project's public/anonymous client key; RLS is responsible for protecting data. Never expose a service-role key.

## Database model

The initial migration at `supabase/migrations/202610180001_shared_workspace.sql` creates:

- `workspaces`: an operations workspace and its owner.
- `workspace_members`: which authenticated users can access a workspace, with owner/admin/member/viewer roles.
- `tasks`: task records, constrained to the statuses and priorities already used by OpsFlow.
- `operational_exceptions`: exception records, constrained to existing severity and status values.

The additive hardening migration at `supabase/migrations/202611170001_secure_workspace_ownership.sql` changes the authorization boundary:

- Only the current workspace owner can update workspace metadata, and ordinary updates must retain the caller as `owner_id`.
- Admins may manage non-owner memberships but cannot assign the `owner` role.
- The owner membership cannot be changed or removed through generic membership CRUD.
- Ownership transfer uses `public.transfer_workspace_ownership(workspace_id, new_owner_id)`. The caller must be the current owner, the recipient must already be a member, and the former owner becomes an admin.

Tasks and exceptions are scoped by `workspace_id`. Existing policies limit authenticated users to workspaces where they are members. Ordinary members can create and update tasks and exceptions; viewers have read-only access. The interface also disables task/exception status controls for viewers. All these rules still need live verification using distinct test accounts and direct API requests.

## Setup

1. Create a Supabase project.
2. Apply the initial schema migration, then apply subsequent migrations in timestamp order. For an existing project, apply the new ownership-hardening migration after the initial shared-workspace migration.
3. In **Authentication → Users**, create or sign up the first user.
4. Copy that user's UUID from the Auth user record.
5. In SQL Editor, create the initial workspace and owner membership by running the two commented statements at the bottom of the initial migration, replacing the placeholder UUIDs. Use the workspace UUID returned by the first statement in the second.
6. Configure the app with the Supabase project URL and public anon/publishable key. For local development, copy `.env.example` to `.env.local`; do not commit populated environment files.
7. Configure GitHub Actions repository variables for the same public URL and anon/publishable key before deploying the client integration. These values are public client configuration; RLS and authenticated sessions must protect the data.
8. Confirm email/password auth settings and allowed redirect URLs include the GitHub Pages origin: `https://matteojose3112-bit.github.io` and the app path `https://matteojose3112-bit.github.io/opsflow/`.

## Database regression tests

The SQL tests in `supabase/tests/202611170001_workspace_ownership.test.sql` use pgTAP and fixed test identities. Run them only against a disposable local/test Supabase database, never a production database:

```bash
supabase start
supabase test db
supabase stop --no-backup
```

The dedicated workflow at `.github/workflows/database-tests.yml` runs this suite on pull requests that change `supabase/**`. The tests check that admins cannot self-promote or promote another member to owner, cannot change `owner_id`, retain permitted non-owner membership administration, and that only the current owner can transfer ownership. They also check that the former owner becomes an admin, the new owner receives the owner role, viewers cannot change membership, and non-members cannot read the workspace.

## Security and rollout rules

- Never use a service-role key in frontend code, `VITE_*` variables, GitHub Pages, or public repository files.
- Do not add public read/write RLS policies to make the dashboard work without authentication.
- Do not automatically upload browser-local demo edits into a shared workspace. A later import flow should preview records and ask for confirmation to avoid overwriting shared data.
- Treat a failed remote read/write as an error; do not silently fall back to local writes while presenting the data as shared.
- The current app signs in with email/password, loads the first workspace membership returned for the authenticated user, reads tasks and exceptions from Supabase, and saves status changes remotely. It does not import the browser's old demo edits. The dashboard's account, KPI, and activity panels remain sample data because those tables are not in this initial schema.
- Session tokens are stored in browser local storage. Treat this as a client-side security trade-off and do not use the app for sensitive production records until the deployment and threat model have been reviewed.
- Do not apply the ownership migration to the hosted project until it has been reviewed and passed against a disposable Supabase database.

## Validation checklist

- [x] Add initial SQL migration for workspace and operational tables with RLS policies.
- [x] Add a separate ownership-hardening migration and pgTAP regression test draft.
- [x] Add a dedicated GitHub Actions workflow for local database regression tests.
- [ ] Execute the database regression suite against a disposable Supabase database.
- [ ] Verify anonymous requests cannot read or modify workspace data.
- [ ] Verify a workspace member can read and update that workspace's tasks/exceptions.
- [ ] Verify a non-member cannot access another workspace's records.
- [ ] Verify viewer role is read-only in the app and through direct API requests.
- [x] Connect authenticated app reads/writes for task and exception status.
- [ ] Verify shared updates in two browser sessions.
- [ ] Confirm the configured hosted Supabase project has the expected migrations and policies.
