-- Workspace-scoped account records for OpsFlow.
-- Additive migration: existing task/exception account references are preserved.
-- New and changed references are enforced by the NOT VALID foreign keys.

create table if not exists public.accounts (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  id text not null default gen_random_uuid()::text,
  name text not null check (length(trim(name)) between 1 and 160),
  industry text not null default 'Other' check (length(trim(industry)) between 1 and 120),
  owner text not null default 'Unassigned' check (length(trim(owner)) between 1 and 120),
  health text not null default 'healthy' check (health in ('healthy', 'at_risk', 'critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, id)
);

create index if not exists accounts_workspace_health_idx
  on public.accounts (workspace_id, health);
create index if not exists accounts_workspace_name_idx
  on public.accounts (workspace_id, lower(name));

drop trigger if exists accounts_set_updated_at on public.accounts;
create trigger accounts_set_updated_at before update on public.accounts
for each row execute function public.set_updated_at();

alter table public.accounts enable row level security;

drop policy if exists "Members can read accounts" on public.accounts;
create policy "Members can read accounts" on public.accounts
for select to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can create accounts" on public.accounts;
create policy "Members can create accounts" on public.accounts
for insert to authenticated
with check (public.is_workspace_editor(workspace_id));

drop policy if exists "Members can update accounts" on public.accounts;
create policy "Members can update accounts" on public.accounts
for update to authenticated
using (public.is_workspace_editor(workspace_id))
with check (public.is_workspace_editor(workspace_id));

drop policy if exists "Admins can delete accounts" on public.accounts;
create policy "Admins can delete accounts" on public.accounts
for delete to authenticated
using (public.is_workspace_admin(workspace_id));

grant select, insert, update, delete on public.accounts to authenticated;

-- Composite foreign keys prevent a task or exception from linking to an
-- account in another workspace. NOT VALID preserves legacy orphaned demo IDs
-- while enforcing referential integrity for new writes.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tasks_account_workspace_fk'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_account_workspace_fk
      foreign key (workspace_id, account_id)
      references public.accounts (workspace_id, id)
      on delete set null (account_id)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'exceptions_account_workspace_fk'
      and conrelid = 'public.operational_exceptions'::regclass
  ) then
    alter table public.operational_exceptions
      add constraint exceptions_account_workspace_fk
      foreign key (workspace_id, account_id)
      references public.accounts (workspace_id, id)
      on delete set null (account_id)
      not valid;
  end if;
end;
$$;
