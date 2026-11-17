-- Tighten workspace ownership and membership authorization.
-- Ownership changes are intentionally separated from ordinary workspace updates.

-- Preserve owner/admin workspace-name management while removing table-level
-- UPDATE. Authenticated clients can update only the name column; owner_id and
-- other protected columns are writable only by the security-definer transfer
-- function below.
drop policy if exists "Owners and admins can update workspaces" on public.workspaces;
drop policy if exists "Workspace owners can update workspace details" on public.workspaces;
drop policy if exists "Owners and admins can update workspace details" on public.workspaces;
create policy "Owners and admins can update workspace details" on public.workspaces
for update to authenticated
using (public.is_workspace_admin(id))
with check (public.is_workspace_admin(id));

revoke update on public.workspaces from authenticated;
grant update (name) on public.workspaces to authenticated;

-- Admins may add ordinary members, but only the actual workspace owner may
-- create the initial owner membership for themselves.
drop policy if exists "Workspace owners can add members" on public.workspace_members;
create policy "Workspace owners and admins can add non-owner members" on public.workspace_members
for insert to authenticated
with check (
  (
    public.is_workspace_owner(workspace_id)
    and (role <> 'owner' or user_id = (select auth.uid()))
  )
  or (
    public.is_workspace_admin(workspace_id)
    and role <> 'owner'
  )
);

-- Membership identity/workspace columns are immutable through generic CRUD.
-- Owners/admins may change only the role of non-owner membership rows.
drop policy if exists "Owners and admins can change member roles" on public.workspace_members;
drop policy if exists "Owners and admins can change non-owner member roles" on public.workspace_members;
create policy "Owners and admins can change non-owner member roles" on public.workspace_members
for update to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and role <> 'owner'
)
with check (
  public.is_workspace_admin(workspace_id)
  and role <> 'owner'
);

revoke update on public.workspace_members from authenticated;
grant update (role) on public.workspace_members to authenticated;

drop policy if exists "Owners and admins can remove members" on public.workspace_members;
drop policy if exists "Owners and admins can remove non-owner members" on public.workspace_members;
create policy "Owners and admins can remove non-owner members" on public.workspace_members
for delete to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and role <> 'owner'
);

-- Transfer ownership atomically. The former owner retains access as an admin;
-- the new owner must already be a member of the same workspace.
create or replace function public.transfer_workspace_ownership(
  target_workspace_id uuid,
  new_owner_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_owner_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required to transfer workspace ownership'
      using errcode = '42501';
  end if;

  select w.owner_id
    into current_owner_id
    from public.workspaces as w
   where w.id = target_workspace_id
   for update;

  if current_owner_id is null then
    raise exception 'Workspace not found'
      using errcode = 'P0002';
  end if;

  if current_owner_id <> (select auth.uid()) then
    raise exception 'Only the current workspace owner can transfer ownership'
      using errcode = '42501';
  end if;

  if new_owner_id is null or new_owner_id = current_owner_id then
    raise exception 'A different, non-null new owner is required'
      using errcode = '22023';
  end if;

  -- Lock both membership rows so a concurrent member removal cannot leave the
  -- workspace owner_id and owner membership out of sync during the transfer.
  perform 1
    from public.workspace_members as wm
   where wm.workspace_id = target_workspace_id
     and wm.user_id in (current_owner_id, new_owner_id)
   order by wm.user_id
   for update;

  if not exists (
    select 1
      from public.workspace_members as wm
     where wm.workspace_id = target_workspace_id
       and wm.user_id = current_owner_id
  ) then
    raise exception 'The current owner must have a workspace membership'
      using errcode = '23503';
  end if;

  if not exists (
    select 1
      from public.workspace_members as wm
     where wm.workspace_id = target_workspace_id
       and wm.user_id = new_owner_id
  ) then
    raise exception 'The new owner must already be a workspace member'
      using errcode = '23503';
  end if;

  update public.workspaces
     set owner_id = new_owner_id
   where id = target_workspace_id;

  update public.workspace_members
     set role = case
       when user_id = new_owner_id then 'owner'
       when user_id = current_owner_id then 'admin'
       else role
     end
   where workspace_id = target_workspace_id
     and user_id in (current_owner_id, new_owner_id);
end;
$$;

revoke all on function public.transfer_workspace_ownership(uuid, uuid) from public;
grant execute on function public.transfer_workspace_ownership(uuid, uuid) to authenticated;
