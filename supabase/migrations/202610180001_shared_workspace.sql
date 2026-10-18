-- OpsFlow shared workspace foundation (Supabase / PostgreSQL)
-- Apply through Supabase SQL Editor or Supabase CLI after creating a project.
-- Access is restricted to authenticated workspace members by row-level security.

create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.tasks (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  id text not null,
  title text not null check (length(trim(title)) between 1 and 240),
  description text not null default '',
  status text not null check (status in ('todo', 'in_progress', 'blocked', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  owner text not null,
  due_date date not null,
  account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, id)
);

create index if not exists tasks_workspace_status_idx on public.tasks (workspace_id, status);
create index if not exists tasks_workspace_due_date_idx on public.tasks (workspace_id, due_date);

create table if not exists public.operational_exceptions (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  id text not null,
  title text not null check (length(trim(title)) between 1 and 240),
  description text not null default '',
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('open', 'investigating', 'resolved')),
  owner text not null,
  created_at timestamptz not null default now(),
  due_date date,
  account_id text,
  task_id text,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, id),
  constraint operational_exceptions_task_fk
    foreign key (workspace_id, task_id)
    references public.tasks (workspace_id, id)
    on delete set null (task_id)
);

create index if not exists exceptions_workspace_status_idx
  on public.operational_exceptions (workspace_id, status);
create index if not exists exceptions_workspace_severity_idx
  on public.operational_exceptions (workspace_id, severity);

-- Keep updated_at current for every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists exceptions_set_updated_at on public.operational_exceptions;
create trigger exceptions_set_updated_at before update on public.operational_exceptions
for each row execute function public.set_updated_at();

-- Helper is SECURITY DEFINER to avoid recursive RLS evaluation on workspace_members.
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.tasks enable row level security;
alter table public.operational_exceptions enable row level security;

drop policy if exists "Members can read their workspaces" on public.workspaces;
create policy "Members can read their workspaces" on public.workspaces
for select to authenticated using (public.is_workspace_member(id));

drop policy if exists "Authenticated users can create owned workspaces" on public.workspaces;
create policy "Authenticated users can create owned workspaces" on public.workspaces
for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "Owners and admins can update workspaces" on public.workspaces;
create policy "Owners and admins can update workspaces" on public.workspaces
for update to authenticated
using (exists (
  select 1 from public.workspace_members wm
  where wm.workspace_id = id and wm.user_id = (select auth.uid())
    and wm.role in ('owner', 'admin')
))
with check (exists (
  select 1 from public.workspace_members wm
  where wm.workspace_id = id and wm.user_id = (select auth.uid())
    and wm.role in ('owner', 'admin')
));

drop policy if exists "Members can read workspace membership" on public.workspace_members;
create policy "Members can read workspace membership" on public.workspace_members
for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace owners can add members" on public.workspace_members;
create policy "Workspace owners can add members" on public.workspace_members
for insert to authenticated with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.workspace_members current_member
    where current_member.workspace_id = workspace_id
      and current_member.user_id = (select auth.uid())
      and current_member.role in ('owner', 'admin')
  )
);

drop policy if exists "Owners and admins can change member roles" on public.workspace_members;
create policy "Owners and admins can change member roles" on public.workspace_members
for update to authenticated
using (exists (
  select 1 from public.workspace_members current_member
  where current_member.workspace_id = workspace_id
    and current_member.user_id = (select auth.uid())
    and current_member.role in ('owner', 'admin')
))
with check (exists (
  select 1 from public.workspace_members current_member
  where current_member.workspace_id = workspace_id
    and current_member.user_id = (select auth.uid())
    and current_member.role in ('owner', 'admin')
));

drop policy if exists "Owners and admins can remove members" on public.workspace_members;
create policy "Owners and admins can remove members" on public.workspace_members
for delete to authenticated using (exists (
  select 1 from public.workspace_members current_member
  where current_member.workspace_id = workspace_id
    and current_member.user_id = (select auth.uid())
    and current_member.role in ('owner', 'admin')
));

drop policy if exists "Members can read tasks" on public.tasks;
create policy "Members can read tasks" on public.tasks
for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can create tasks" on public.tasks;
create policy "Members can create tasks" on public.tasks
for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can update tasks" on public.tasks;
create policy "Members can update tasks" on public.tasks
for update to authenticated using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can delete tasks" on public.tasks;
create policy "Admins can delete tasks" on public.tasks
for delete to authenticated using (exists (
  select 1 from public.workspace_members wm
  where wm.workspace_id = workspace_id and wm.user_id = (select auth.uid())
    and wm.role in ('owner', 'admin')
));

drop policy if exists "Members can read exceptions" on public.operational_exceptions;
create policy "Members can read exceptions" on public.operational_exceptions
for select to authenticated using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can create exceptions" on public.operational_exceptions;
create policy "Members can create exceptions" on public.operational_exceptions
for insert to authenticated with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can update exceptions" on public.operational_exceptions;
create policy "Members can update exceptions" on public.operational_exceptions
for update to authenticated using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Admins can delete exceptions" on public.operational_exceptions;
create policy "Admins can delete exceptions" on public.operational_exceptions
for delete to authenticated using (exists (
  select 1 from public.workspace_members wm
  where wm.workspace_id = workspace_id and wm.user_id = (select auth.uid())
    and wm.role in ('owner', 'admin')
));

grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.operational_exceptions to authenticated;

-- Create the first workspace and owner membership after the first user signs up:
-- replace the UUID with the user's auth.users.id and run:
-- insert into public.workspaces (name, owner_id)
-- values ('OpsFlow Workspace', 'YOUR-AUTH-USER-UUID')
-- returning id;
-- insert into public.workspace_members (workspace_id, user_id, role)
-- values ('RETURNED-WORKSPACE-UUID', 'YOUR-AUTH-USER-UUID', 'owner');
