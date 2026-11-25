-- Run with: supabase test db
-- These tests require a disposable Supabase local/test database with the
-- repository migrations applied. All fixture rows are rolled back.

create extension if not exists pgtap with schema extensions;

begin;

select extensions.plan(25);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'opsflow-owner-test@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'opsflow-admin-test@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'opsflow-member-test@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'opsflow-viewer-test@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('10000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'opsflow-outsider-test@example.invalid', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.workspaces (id, name, owner_id)
values (
  '20000000-0000-4000-8000-000000000001',
  'Ownership policy regression workspace',
  '10000000-0000-4000-8000-000000000001'
);

insert into public.workspace_members (workspace_id, user_id, role)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'admin'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'member'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'viewer');

set local role authenticated;

-- An admin cannot promote their own membership or another member to owner.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select extensions.throws_ok(
  $$update public.workspace_members set role = 'owner'
       where workspace_id = '20000000-0000-4000-8000-000000000001'
         and user_id = '10000000-0000-4000-8000-000000000002'$$,
  '42501',
  null,
  'admin cannot promote itself to owner'
);
select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000002'),
  'admin',
  'admin membership remains unchanged after rejected self-promotion'
);

select extensions.throws_ok(
  $$update public.workspace_members set role = 'owner'
       where workspace_id = '20000000-0000-4000-8000-000000000001'
         and user_id = '10000000-0000-4000-8000-000000000003'$$,
  '42501',
  null,
  'admin cannot promote another member to owner'
);
select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000003'),
  'member',
  'member role remains unchanged after rejected promotion'
);

select extensions.throws_ok(
  $$update public.workspaces
       set owner_id = '10000000-0000-4000-8000-000000000002'
     where id = '20000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'admin cannot update owner_id'
);
select extensions.is(
  (select owner_id::text from public.workspaces
    where id = '20000000-0000-4000-8000-000000000001'),
  '10000000-0000-4000-8000-000000000001',
  'workspace owner remains unchanged after rejected admin update'
);

update public.workspaces set name = 'Renamed by admin'
 where id = '20000000-0000-4000-8000-000000000001';
select extensions.is(
  (select name from public.workspaces
    where id = '20000000-0000-4000-8000-000000000001'),
  'Renamed by admin',
  'admin can still update permitted workspace metadata'
);

-- Admins retain role management, but cannot reassign a membership identity.
update public.workspace_members set role = 'viewer'
 where workspace_id = '20000000-0000-4000-8000-000000000001'
   and user_id = '10000000-0000-4000-8000-000000000003';
select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000003'),
  'viewer',
  'admin can still assign a permitted non-owner role'
);

select extensions.throws_ok(
  $$update public.workspace_members
       set user_id = '10000000-0000-4000-8000-000000000005'
     where workspace_id = '20000000-0000-4000-8000-000000000001'
       and user_id = '10000000-0000-4000-8000-000000000003'$$,
  '42501',
  null,
  'admin cannot reassign a membership to another user'
);

-- Delete policies filter protected rows rather than raising an error. Assert
-- the affected-row count and resulting membership state explicitly.
delete from public.workspace_members
 where workspace_id = '20000000-0000-4000-8000-000000000001'
   and user_id = '10000000-0000-4000-8000-000000000001';
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000001'),
  1,
  'admin cannot delete the workspace owner membership'
);
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000001'
      and role = 'owner'),
  1,
  'owner membership remains intact after admin delete attempt'
);
delete from public.workspace_members
 where workspace_id = '20000000-0000-4000-8000-000000000001'
   and user_id = '10000000-0000-4000-8000-000000000003';
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000003'),
  0,
  'admin can remove an ordinary member'
);
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000003'),
  0,
  'removed ordinary member no longer has a membership row'
);

select extensions.throws_ok(
  $$select public.transfer_workspace_ownership(
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000003'
    )$$,
  '42501',
  null,
  'admin cannot invoke the ownership transfer operation'
);

-- The owner cannot change owner_id or assign owner through generic CRUD.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select extensions.throws_ok(
  $$update public.workspaces
       set owner_id = '10000000-0000-4000-8000-000000000002'
     where id = '20000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'owner cannot bypass the explicit transfer operation'
);

select extensions.throws_ok(
  $$update public.workspace_members set role = 'owner'
       where workspace_id = '20000000-0000-4000-8000-000000000001'
         and user_id = '10000000-0000-4000-8000-000000000004''$$,
  '42501',
  null,
  'owner cannot promote a member through generic role updates'
);

select extensions.throws_ok(
  $$select public.transfer_workspace_ownership(
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000005'
    )$$,
  '23503',
  null,
  'owner cannot transfer ownership to a non-member'
);

select extensions.lives_ok(
  $$select public.transfer_workspace_ownership(
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002'
    )$$,
  'current owner can transfer ownership to an existing member'
);

select extensions.is(
  (select owner_id::text from public.workspaces
    where id = '20000000-0000-4000-8000-000000000001'),
  '10000000-0000-4000-8000-000000000002',
  'ownership transfer updates workspaces.owner_id'
);

select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000001'),
  'admin',
  'former owner retains access as an admin'
);

select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000002'),
  'owner',
  'new owner receives the owner membership role'
);

-- Even the current owner cannot remove the protected owner row through
-- generic membership CRUD; transfer remains the only ownership operation.
delete from public.workspace_members
 where workspace_id = '20000000-0000-4000-8000-000000000001'
   and user_id = '10000000-0000-4000-8000-000000000002';
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000002'),
  1,
  'current owner cannot delete its own owner membership'
);
select extensions.is(
  (select count(*)::integer from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000002'
      and role = 'owner'),
  1,
  'current owner membership remains intact after delete attempt'
);

-- A viewer cannot alter membership; a non-member cannot see the workspace.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
update public.workspace_members set role = 'admin'
 where workspace_id = '20000000-0000-4000-8000-000000000001'
   and user_id = '10000000-0000-4000-8000-000000000004';
select extensions.is(
  (select role from public.workspace_members
    where workspace_id = '20000000-0000-4000-8000-000000000001'
      and user_id = '10000000-0000-4000-8000-000000000004'),
  'viewer',
  'viewer cannot change membership roles'
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000005', true);
select extensions.is(
  (select count(*)::integer from public.workspaces
    where id = '20000000-0000-4000-8000-000000000001'),
  0,
  'non-member cannot read the workspace'
);

select * from extensions.finish();
rollback;
