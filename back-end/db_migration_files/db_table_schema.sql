-- Table DDL 
-- ORGANIZATIONS
create table if not exists organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  logo_url      text,
  website       text,
  phone         text,
  address_line1 text,
  address_line2 text,
  city          text,
  postal_code   text,
  country       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- USER_PROFILES (app-side user record; key = auth.users.id)
create table if not exists user_profiles (
  user_id        uuid primary key
                 references auth.users (id) on delete cascade,
  full_name      text,
  email          text,
  phone          text,
  avatar_url     text,
  timezone       text,
  default_org_id uuid references organizations(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);


-- ORGANIZATION_USERS (membership join; powers RLS)
create table if not exists organization_users (
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references user_profiles(user_id) on delete cascade,
  role            text not null check (role in ('owner')),
  primary key (organization_id, user_id)
);


-- INSPECTORS (domain persona; optionally linked to a user)
create table if not exists inspectors (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references organizations(id) on delete cascade,
  user_id              uuid references user_profiles(user_id) on delete set null,
  full_name            text not null,
  email                text unique,
  phone                text,
  license_number       text unique,
  certifications       text[] not null default '{}',
  signature_image_url  text,
  timezone             text,
  bio                  text,
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);


-- PROPERTIES (org-scoped per ERD)
create table if not exists properties (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  address_line1   text not null,
  address_line2   text,
  unit            text,
  city            text not null,
  region          text,
  postal_code     text,
  country         text not null,
  year_built      smallint,
  dwelling_type   text check (dwelling_type in ('house','townhome','condo','other')),
  sqft            integer,
  bedrooms        integer,
  bathrooms       integer,
  garage          boolean,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- INSPECTIONS
create table if not exists inspections (
  id               uuid primary key default gen_random_uuid(),
  inspector_id     uuid not null references inspectors(id) on delete restrict,
  property_id      uuid not null references properties(id) on delete restrict,
  organization_id  uuid not null references organizations(id) on delete cascade,
  status           text not null check (status in ('draft','in_progress','ready_for_review','published')),
  created_at       timestamptz not null default now(),
  scheduled_for    timestamptz,
  started_at       timestamptz,
  completed_at     timestamptz,
  updated_at       timestamptz not null default now(),
  summary          text
);


-- INSPECTION_SECTIONS
create table if not exists inspection_sections (
  id              uuid primary key default gen_random_uuid(),
  inspection_id   uuid not null references inspections(id) on delete cascade,
  section_name    text not null,
  notes           text,
  priority_rating smallint check (priority_rating between 0 and 5)
);


-- OBSERVATIONS
create table if not exists observations (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references inspection_sections(id) on delete cascade,
  obs_name     text not null,
  description  text,
  implication  text,
  recommendation  text,
  severity     text check (severity in ('minor','moderate','critical')),
  status       text check (status in ('open','resolved','defer')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- OBSERVATION_MEDIA
create table if not exists observation_media (
  media_id        uuid primary key default gen_random_uuid(),
  observation_id  uuid not null references observations(id) on delete cascade,
  type            text not null check (type in ('photo','video','audio')),
  storage_key     text not null,
  caption         text,
  transcription   text,
  annotated_flag  boolean not null default false,
  created_at      timestamptz not null default now(),
  is_primary      boolean not null default false,
  sort_order      integer not null default 0
);


-- REPORTS
create table if not exists reports (
  id             uuid primary key default gen_random_uuid(),
  inspection_id  uuid not null references inspections(id) on delete cascade,
  version        integer not null,
  status         text not null check (status in ('draft','published')),
  pdf_url        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (inspection_id, version),
  check (version > 0)
);