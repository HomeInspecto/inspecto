-- Helpers: small functions to simplify policies

-- is_org_member(p_org_id uuid)
-- Description: Returns true when the current authenticated user is a member of the given organization.
-- Typical callers: RLS policies that allow read access to org-scoped records (e.g., rows from organizations, properties, inspections).
-- Example usage: SELECT is_org_member('3fa85f64-5717-4562-b3fc-2c963f66afa6');
create or replace function is_org_member(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from organization_users ou
    where ou.organization_id = p_org_id
      and ou.user_id = auth.uid()
  );
$$;

-- is_org_owner(p_org_id uuid)
-- Description: Returns true when the current authenticated user is an OWNER of the specified organization.
-- Typical callers: RLS policies that restrict create/update/delete actions to org owners (admin-level operations such as membership changes).
-- Example usage: SELECT is_org_owner('3fa85f64-5717-4562-b3fc-2c963f66afa6');
create or replace function is_org_owner(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from organization_users ou
    where ou.organization_id = p_org_id
      and ou.user_id = auth.uid()
      and ou.role = 'owner'
  );
$$;

-- Enabling row level security on all tables.

alter table organizations        enable row level security;
alter table user_profiles        enable row level security;
alter table organization_users   enable row level security;
alter table inspectors           enable row level security;
alter table properties           enable row level security;
alter table inspections          enable row level security;
alter table inspection_sections  enable row level security;
alter table observations         enable row level security;
alter table observation_media    enable row level security;
alter table reports              enable row level security;

-- RLS POLICIES to be reviewed before implementation here

-- organization_users table RLS policies (membership join; owners manage membership)
------------------------------------------------------------------------------------

-- ou_select_self
-- Description: Allows authenticated users to SELECT organization_users rows that reference their own user_id.
-- Typical callers: Clients listing their memberships or roles across organizations.
-- Example caller: SELECT * FROM organization_users WHERE user_id = auth.uid();
create policy if not exists ou_select_self
on organization_users
for select
to authenticated
using (user_id = auth.uid());

-- ou_select_owner_org
-- Description: Allows organization owners to SELECT membership rows for their organization, enabling owner-level inspection of membership.
-- Notes: This complements ou_select_self so owners can view all members in their org.
-- Example caller: SELECT * FROM organization_users WHERE organization_id = 'org-uuid' AND is_org_owner(organization_id);
create policy if not exists ou_select_owner_org
on organization_users
for select
to authenticated
using (is_org_owner(organization_id));

-- ou_insert_owner
-- Description: Restricts INSERT into organization_users so only an org owner can add a new membership row for that organization.
-- Notes: This prevents regular members from granting membership to others.
-- Example caller: INSERT INTO organization_users (organization_id, user_id, role) VALUES ('org-uuid', 'user-uuid', 'member') -- only succeeds for owner.
create policy if not exists ou_insert_owner
on organization_users
for insert
to authenticated
with check (is_org_owner(organization_id));

-- ou_update_owner
-- Description: Allows only org owners to UPDATE membership rows in their organization and enforces owner check for new values.
-- Notes: Ensures that membership changes (role updates, etc.) can only be made by owners.
-- Example caller: UPDATE organization_users SET role='admin' WHERE organization_id='org-uuid' AND user_id='member-uuid';
create policy if not exists ou_update_owner
on organization_users
for update
to authenticated
using (is_org_owner(organization_id))
with check (is_org_owner(organization_id));

-- ou_delete_owner
-- Description: Allows only org owners to DELETE membership rows in their organization.
-- Notes: Prevents non-owners from removing other members; consider safeguards to avoid an owner deleting their own last owner row.
-- Example caller: DELETE FROM organization_users WHERE organization_id='org-uuid' AND user_id='member-uuid';
create policy if not exists ou_delete_owner
on organization_users
for delete
to authenticated
using (is_org_owner(organization_id));



-- organizations table RLS policies (members can see, owners can edit)
-----------------------------------------------------------------------

-- org_select_member
-- Description: Lets any organization member SELECT the organization's row (e.g., to show org name and settings).
-- Notes: This allows typical member-level reads; ensure sensitive fields are handled appropriately (e.g., masked or moved to a separate table with stricter policies).
-- Example caller: SELECT * FROM organizations WHERE id = 'org-uuid' AND is_org_member(id);
create policy if not exists org_select_member
on organizations
for select
to authenticated
using (is_org_member(id));

-- org_update_owner
-- Description: Restricts UPDATE on organizations to owners only and enforces owner check on the new values.
-- Notes: Use this for editing org-level settings. Consider requiring additional audit logging for org updates.
-- Example caller: UPDATE organizations SET name='New Org' WHERE id='org-uuid';
create policy if not exists org_update_owner
on organizations
for update
to authenticated
using (is_org_owner(id))
with check (is_org_owner(id));



-- user_profiles table RLS policies (each user manages only their own profile)
------------------------------------------------------------------------------

-- up_select_own
-- Description: Allows authenticated users to SELECT only their own profile row.
-- Notes: Relies on auth.uid(); returns no rows for unauthenticated requests. Ensure user_profiles.user_id is indexed.
-- Example caller: SELECT * FROM user_profiles WHERE user_id = auth.uid();
create policy if not exists up_select_own
on user_profiles
for select
to authenticated
using (user_id = auth.uid());

-- up_insert_own
-- Description: Permits authenticated users to INSERT a profile only when the inserted user_id equals the authenticated user's id.
-- Notes: Protects against creating profiles for other users. Consider adding a UNIQUE constraint on user_id if not present.
-- Example caller: INSERT INTO user_profiles (user_id, display_name) VALUES (auth.uid(), 'Alice');
create policy if not exists up_insert_own
on user_profiles
for insert
to authenticated
with check (user_id = auth.uid());

-- up_update_own
-- Description: Allows authenticated users to UPDATE only their own profile rows and ensures updates do not change ownership.
-- Notes: The USING clause ensures only rows owned by the user are updatable; WITH CHECK prevents changing user_id to another value.
-- Example caller: UPDATE user_profiles SET display_name = 'New' WHERE user_id = auth.uid();
create policy if not exists up_update_own
on user_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());



-- inspectors table RLS policies (org-scoped)
---------------------------------------------

-- insp_select_member
-- Description: Allows members of the inspector's organization to SELECT inspector rows for that organization.
-- Typical callers: UI listing inspectors available to a member within their org.
-- Example caller: SELECT * FROM inspectors WHERE organization_id = 'org-uuid' AND is_org_member(organization_id);
create policy if not exists insp_select_member
on inspectors
for select
to authenticated
using (is_org_member(organization_id));

-- insp_cud_owner
-- Description: Grants owners full create/update/delete (ALL) permissions on inspectors for their organization.
-- Notes: Using FOR ALL is convenient but remember it also affects SELECT unless other policies restrict SELECT separately.
-- Example caller: INSERT INTO inspectors (organization_id, name) VALUES ('org-uuid','Inspector A');
create policy if not exists insp_cud_owner
on inspectors
for all
to authenticated
using (is_org_owner(organization_id))
with check (is_org_owner(organization_id));



-- properties table RLS policies (org-scoped, per ERD)
------------------------------------------------------

-- props_select_member
-- Description: Allows organization members to SELECT property records belonging to their organization.
-- Typical callers: Listing properties in the org dashboard for members.
-- Example caller: SELECT * FROM properties WHERE organization_id = 'org-uuid';
create policy if not exists props_select_member
on properties
for select
to authenticated
using (is_org_member(organization_id));

-- props_cud_owner
-- Description: Restricts create/update/delete on properties to org owners only.
-- Notes: Use WITH CHECK to validate new/updated rows still belong to the owner organization.
-- Example caller: DELETE FROM properties WHERE id = 'property-uuid';
create policy if not exists props_cud_owner
on properties
for all
to authenticated
using (is_org_owner(organization_id))
with check (is_org_owner(organization_id));



-- inspections table RLS policies (direct org_id, so cheap checks)
------------------------------------------------------------------

-- inspn_select_member
-- Description: Lets organization members SELECT inspections that belong to their organization.
-- Notes: Because inspections contain the organization_id directly, this policy checks are inexpensive.
-- Example caller: SELECT * FROM inspections WHERE organization_id = 'org-uuid';
create policy if not exists inspn_select_member
on inspections
for select
to authenticated
using (is_org_member(organization_id));

-- inspn_cud_owner
-- Description: Restricts creation/updates/deletes on inspections to organization owners only.
-- Notes: Consider adding audit fields (created_by, updated_by) and ensuring they are populated correctly at insert/update time.
-- Example caller: INSERT INTO inspections (organization_id, date) VALUES ('org-uuid', now());
create policy if not exists inspn_cud_owner
on inspections
for all
to authenticated
using (is_org_owner(organization_id))
with check (is_org_owner(organization_id));



-- inspection_sections table RLS policies (via inspections -> organization_id)
------------------------------------------------------------------------------

-- sect_select_member
-- Description: Allows members to SELECT inspection_sections only when the parent inspection belongs to an organization the user is a member of.
-- Notes: This uses a correlated EXISTS with inspections; ensure inspections.id is indexed for performance.
-- Example caller: SELECT * FROM inspection_sections WHERE inspection_id = 'inspection-uuid';
create policy if not exists sect_select_member
on inspection_sections
for select
to authenticated
using (
  exists (
    select 1
    from inspections i
    where i.id = inspection_sections.inspection_id
      and is_org_member(i.organization_id)
  )
);

-- sect_cud_owner
-- Description: Grants owners full permissions on inspection_sections, but only when the parent inspection belongs to their organization.
-- Notes: Both USING and WITH CHECK reference the parent inspection; ensure referential integrity to avoid orphaned sections.
-- Example caller: INSERT INTO inspection_sections (inspection_id, title) VALUES ('inspection-uuid','Section A');
create policy if not exists sect_cud_owner
on inspection_sections
for all
to authenticated
using (
  exists (
    select 1
    from inspections i
    where i.id = inspection_sections.inspection_id
      and is_org_owner(i.organization_id)
  )
)
with check (
  exists (
    select 1
    from inspections i
    where i.id = inspection_sections.inspection_id
      and is_org_owner(i.organization_id)
  )
);



-- observations table RLS policies (via sections -> inspections -> organization_id)
-----------------------------------------------------------------------------------

-- obs_select_member
-- Description: Allows members to SELECT observations when the observation's section belongs to an inspection in their organization.
-- Notes: The policy does a join from observation -> section -> inspection; index observations.section_id and inspection_sections.inspection_id for best performance.
-- Example caller: SELECT * FROM observations WHERE section_id = 'section-uuid';
create policy if not exists obs_select_member
on observations
for select
to authenticated
using (
  exists (
    select 1
    from inspection_sections s
    join inspections i on i.id = s.inspection_id
    where s.id = observations.section_id
      and is_org_member(i.organization_id)
  )
);

-- obs_cud_owner
-- Description: Restricts create/update/delete of observations to org owners, validated against the observation's parent inspection.
-- Notes: Ensure clients supply valid section_id values; consider adding triggers or foreign key constraints to guarantee referential integrity.
-- Example caller: UPDATE observations SET note='Updated' WHERE id='obs-uuid';
create policy if not exists obs_cud_owner
on observations
for all
to authenticated
using (
  exists (
    select 1
    from inspection_sections s
    join inspections i on i.id = s.inspection_id
    where s.id = observations.section_id
      and is_org_owner(i.organization_id)
  )
)
with check (
  exists (
    select 1
    from inspection_sections s
    join inspections i on i.id = s.inspection_id
    where s.id = observations.section_id
      and is_org_owner(i.organization_id)
  )
);



-- observation_media table RLS policies (via observations -> sections -> inspections -> organization_id)
--------------------------------------------------------------------------------------------------------

-- media_select_member
-- Description: Allows members to SELECT observation media when the media is attached to an observation within their organization.
-- Notes: This policy joins observations -> sections -> inspections; ensure media table references observation_id and that those columns are indexed.
-- Example caller: SELECT * FROM observation_media WHERE observation_id = 'obs-uuid';
create policy if not exists media_select_member
on observation_media
for select
to authenticated
using (
  exists (
    select 1
    from observations o
    join inspection_sections s on s.id = o.section_id
    join inspections i on i.id = s.inspection_id
    where o.id = observation_media.observation_id
      and is_org_member(i.organization_id)
  )
);

-- media_cud_owner
-- Description: Restricts create/update/delete of observation_media to org owners based on the parent inspection's organization.
-- Notes: For performance, index observations.id, inspection_sections.id, and inspections.id; validate file storage ACLs separately (e.g., Supabase Storage policies).
-- Example caller: INSERT INTO observation_media (observation_id, url) VALUES ('obs-uuid','https://...') ;
create policy if not exists media_cud_owner
on observation_media
for all
to authenticated
using (
  exists (
    select 1
    from observations o
    join inspection_sections s on s.id = o.section_id
    join inspections i on i.id = s.inspection_id
    where o.id = observation_media.observation_id
      and is_org_owner(i.organization_id)
  )
)
with check (
  exists (
    select 1
    from observations o
    join inspection_sections s on s.id = o.section_id
    join inspections i on i.id = s.inspection_id
    where o.id = observation_media.observation_id
      and is_org_owner(i.organization_id)
  )
);



-- reports table RLS policies (via inspections -> organization_id)
------------------------------------------------------------------

-- rpt_select_member
-- Description: Allows members to SELECT reports that belong to inspections within their organization.
-- Notes: Reports are filtered by the inspection_id foreign key; index reports.inspection_id for efficient checks.
-- Example caller: SELECT * FROM reports WHERE inspection_id = 'inspection-uuid';
create policy if not exists rpt_select_member
on reports
for select
to authenticated
using (
  exists (
    select 1 from inspections i
    where i.id = reports.inspection_id
      and is_org_member(i.organization_id)
  )
);

-- rpt_cud_owner
-- Description: Restricts create/update/delete of reports to organization owners, validated against the parent inspection's organization.
-- Notes: Consider whether report content should have additional visibility rules (e.g., auditors vs. members) and document that separately.
-- Example caller: DELETE FROM reports WHERE id = 'report-uuid';
create policy if not exists rpt_cud_owner
on reports
for all
to authenticated
using (
  exists (
    select 1 from inspections i
    where i.id = reports.inspection_id
      and is_org_owner(i.organization_id)
  )
)
with check (
  exists (
    select 1 from inspections i
    where i.id = reports.inspection_id
      and is_org_owner(i.organization_id)
  )
);