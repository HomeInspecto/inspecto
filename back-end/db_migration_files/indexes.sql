-- Potential indexes to test
-- DO NOT RUN UNTIL REVIEWED

-- create index if not exists user_profiles_default_org_idx on user_profiles(default_org_id);

-- create index if not exists organization_users_user_idx on organization_users(user_id);

-- create index if not exists inspectors_org_idx on inspectors(organization_id);
-- create index if not exists inspectors_user_idx on inspectors(user_id);

-- create index if not exists properties_org_idx on properties(organization_id);

-- create index if not exists inspections_org_idx on inspections(organization_id);
-- create index if not exists inspections_property_idx on inspections(property_id);
-- create index if not exists inspections_inspector_idx on inspections(inspector_id);
-- create index if not exists inspections_status_idx on inspections(status);
-- create index if not exists inspections_scheduled_idx on inspections(scheduled_for);

-- create index if not exists inspection_sections_inspection_idx on inspection_sections(inspection_id);

-- create index if not exists observations_section_idx on observations(section_id);
-- create index if not exists observations_status_idx on observations(status);
-- create index if not exists observations_severity_idx on observations(severity);
-- create index if not exists observation_media_obs_idx on observation_media(observation_id);

-- create index if not exists observation_media_obs_idx on observation_media(observation_id);

-- create index if not exists reports_inspection_idx on reports(inspection_id);
-- create index if not exists reports_status_idx on reports(status);
