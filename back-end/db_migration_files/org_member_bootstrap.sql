-- Bootstrap membership / owner ship to organization creator

-- app_create_org(p_name text)
-- Description:
--   RPC function to create a new organization and bootstrap membership for the calling user.
--   **Requires an authenticated caller (auth.uid() must be present). It inserts a row into organizations,
--   adds the caller as an 'owner' in organization_users, and updates the caller's user_profiles.default_org_id.
-- Notes / Security:
--   Implemented with SECURITY DEFINER and search_path = public so it runs with the function owner's privileges.
--   Public execution was revoked and EXECUTE granted to the authenticated role — this allows callers with a valid
--   JWT to create organizations while preventing anonymous invocation. Review the function owner and privileges
--   to avoid privilege escalation risks.
-- Example caller:
--   SELECT app_create_org('My New Organization');
create or replace function app_create_org(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated';
  end if;

  insert into organizations (name) values (p_name)
  returning id into v_org_id;

  insert into organization_users (organization_id, user_id, role)
  values (v_org_id, auth.uid(), 'owner');

  update user_profiles
  set default_org_id = v_org_id
  where user_id = auth.uid();

  return v_org_id;
end;
$$;

-- Execution privileges for app_create_org
-- Description:
--   Revoke all rights on the function from public, then grant EXECUTE to the authenticated role.
--   This restricts RPC usage to authenticated users only.
-- Notes:
--   Keep the function owner account minimal/trusted since SECURITY DEFINER runs with owner privileges.
revoke all on function app_create_org(text) from public;
grant execute on function app_create_org(text) to authenticated;