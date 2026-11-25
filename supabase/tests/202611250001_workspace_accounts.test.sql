-- Run with: supabase test db
-- Workspace account RLS and referential-integrity regression coverage.
create extension if not exists pgtap with schema extensions;

begin;
select extensions.plan(17);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('30000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'accounts-owner@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('30000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'accounts-admin@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('30000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'accounts-member@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('30000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'accounts-viewer@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('30000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'accounts-outsider@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.workspaces (id, name, owner_id)
values
  ('40000000-0000-4000-8000-000000000001', 'Accounts primary workspace', '30000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', 'Accounts second workspace', '30000000-0000-4000-8000-000000000002');

insert into public.workspace_members (workspace_id, user_id, role)
values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'owner'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'admin'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003', 'member'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000004', 'viewer'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 'owner');

insert into public.accounts (workspace_id, id, name, industry, owner, health)
values
  ('40000000-0000-4000-8000-000000000001', 'account-primary', 'Primary Workspace Account', 'Retail', 'Account Owner', 'healthy'),
  ('40000000-0000-4000-8000-000000000002', 'account-secondary', 'Second Workspace Account', 'Logistics', 'Second Owner', 'critical');

insert into public.tasks (workspace_id, id, title, status, priority, owner, due_date, account_id)
values ('40000000-0000-4000-8000-000000000001', 'account-linked-task', 'Account-linked task', 'todo', 'medium', 'Member', current_date + 1, 'account-primary');

set local role authenticated;

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);
select extensions.is((select count(*)::integer from public.accounts), 1, 'owner reads accounts in their workspace');
select extensions.is((select count(*)::integer from public.accounts where id = 'account-secondary'), 0, 'owner cannot read accounts from another workspace');

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000003', true);
select extensions.is((select count(*)::integer from public.accounts where id = 'account-primary'), 1, 'member can read workspace accounts');
select extensions.lives_ok(
  $$insert into public.accounts (workspace_id, id, name, industry, owner, health)
    values ('40000000-0000-4000-8000-000000000001', 'member-created-account', 'Member Created', 'Services', 'Member', 'healthy')$$,
  'member can create an account in their workspace'
);
select extensions.lives_ok(
  $$update public.accounts set health = 'at_risk'
    where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-primary'$$,
  'member can update an account in their workspace'
);
select extensions.is(
  (select health from public.accounts where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-primary'),
  'at_risk',
  'member account update is persisted'
);
select extensions.throws_ok(
  $$insert into public.accounts (workspace_id, id, name)
    values ('40000000-0000-4000-8000-000000000002', 'cross-workspace-create', 'Not allowed')$$,
  '42501',
  null,
  'member cannot create an account in another workspace'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000004', true);
select extensions.is((select count(*)::integer from public.accounts where id = 'account-primary'), 1, 'viewer can read workspace accounts');
select extensions.throws_ok(
  $$insert into public.accounts (workspace_id, id, name)
    values ('40000000-0000-4000-8000-000000000001', 'viewer-created-account', 'Viewer Write')$$,
  '42501',
  null,
  'viewer cannot create accounts'
);
select extensions.throws_ok(
  $$update public.accounts set health = 'critical'
    where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-primary'$$,
  '42501',
  null,
  'viewer cannot update accounts'
);
delete from public.accounts
 where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-primary';
select extensions.is(
  (select count(*)::integer from public.accounts where id = 'account-primary'),
  1,
  'viewer cannot delete accounts'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000005', true);
select extensions.is((select count(*)::integer from public.accounts), 0, 'non-member cannot read workspace accounts');
select extensions.throws_ok(
  $$insert into public.accounts (workspace_id, id, name)
    values ('40000000-0000-4000-8000-000000000001', 'outsider-created-account', 'Outsider Write')$$,
  '42501',
  null,
  'non-member cannot create accounts'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);
select extensions.lives_ok(
  $$delete from public.accounts
    where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-primary'$$,
  'admin can delete accounts'
);
select extensions.is(
  (select account_id from public.tasks where workspace_id = '40000000-0000-4000-8000-000000000001' and id = 'account-linked-task'),
  null,
  'deleting an account clears its task reference'
);
select extensions.is(
  (select count(*)::integer from public.accounts where id = 'account-secondary'),
  1,
  'admin cannot access a separate workspace account as an owner of another workspace'
);

select * from extensions.finish();
rollback;
