-- Triggers 

-- check_inspection_org_consistency()
-- Description:
--   Constraint trigger function that enforces organization consistency for an inspections row.
--   When an inspection is inserted or updated, it ensures the inspection.organization_id matches
--   the organization_id of the referenced property and the referenced inspector. If either referenced
--   row is missing or the three organization IDs are not identical, the function raises an exception,
--   preventing the change.
-- Notes:
--   This provides early validation to avoid cross-organization references (e.g., an inspector from Org A
--   assigned to a property in Org B). It performs two point lookups per row; acceptable for single-row
--   operations but consider bulk insert implications.
-- Example caller:
--   INSERT INTO inspections (id, organization_id, property_id, inspector_id, date) VALUES ('uuid', 'org-uuid', 'prop-uuid', 'insr-uuid', now());
create or replace function check_inspection_org_consistency()
returns trigger
language plpgsql
as $$
declare
  insp_org uuid;
  prop_org uuid;
  insr_org uuid;
begin
  select organization_id into prop_org from properties  where id = new.property_id;
  select organization_id into insr_org from inspectors  where id = new.inspector_id;
  insp_org := new.organization_id;

  if prop_org is null or insr_org is null then
    raise exception 'Property or Inspector not found';
  end if;

  if insp_org <> prop_org or insp_org <> insr_org then
    raise exception 'Organization mismatch: inspection(%), property(%), inspector(%) must match',
      insp_org, prop_org, insr_org;
  end if;

  return new;
end;
$$;

-- trg_inspections_org_consistency
-- Description:
--   Constraint trigger attached to inspections that executes check_inspection_org_consistency()
--   BEFORE INSERT OR UPDATE for each row. Declared DEFERRABLE INITIALLY IMMEDIATE so checks run
--   immediately by default but can be deferred within a transaction if SET CONSTRAINTS is used.
-- Notes:
--   A constraint trigger is appropriate for enforcing data integrity. If expecting bulk loads,
--   consider deferring or batching validation to reduce per-row overhead.
-- Example caller:
--   (implicitly fired) INSERT INTO inspections (...) VALUES (...);
drop trigger if exists trg_inspections_org_consistency on inspections;
-- Using a BEFORE constraint trigger provides early failure to prevent bad data
create constraint trigger trg_inspections_org_consistency
before insert or update on inspections
deferrable initially immediate
for each row execute function check_inspection_org_consistency();