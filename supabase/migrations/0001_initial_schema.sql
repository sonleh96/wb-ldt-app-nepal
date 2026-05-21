create extension if not exists postgis;
create extension if not exists pgcrypto;

create schema if not exists analytics;

create type analytics.pillar as enum (
  'infrastructure',
  'livability',
  'prosperity'
);

create table if not exists analytics.dataset_releases (
  id uuid primary key default gen_random_uuid(),
  release_key text not null unique,
  year integer not null,
  label text not null,
  admin_file_name text,
  score_file_name text,
  geojson_file_name text,
  notes text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists analytics.municipalities (
  id uuid primary key default gen_random_uuid(),
  municipality text not null,
  district text not null,
  province text not null,
  municipality_slug text not null,
  district_slug text not null,
  province_slug text not null,
  composite_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (province, district, municipality)
);

create index if not exists municipalities_province_idx
  on analytics.municipalities (province);

create index if not exists municipalities_district_idx
  on analytics.municipalities (district);

create index if not exists municipalities_slug_idx
  on analytics.municipalities (province_slug, district_slug, municipality_slug);

create table if not exists analytics.municipality_boundaries (
  municipality_id uuid primary key
    references analytics.municipalities(id) on delete cascade,
  source_feature_key text not null,
  geom geometry(MultiPolygon, 4326) not null,
  raw_properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists municipality_boundaries_geom_idx
  on analytics.municipality_boundaries
  using gist (geom);

create table if not exists analytics.boundary_ingest_issues (
  id uuid primary key default gen_random_uuid(),
  release_id uuid references analytics.dataset_releases(id) on delete cascade,
  issue_type text not null,
  municipality text,
  district text,
  province text,
  source_file text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists boundary_ingest_issues_release_idx
  on analytics.boundary_ingest_issues (release_id);

create table if not exists analytics.indicators (
  id text primary key,
  canonical_name text not null unique,
  raw_admin_column text,
  raw_score_column text,
  description text,
  higher_is_better boolean,
  pillar analytics.pillar,
  unit text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists analytics.indicator_sources (
  id bigserial primary key,
  indicator_id text not null
    references analytics.indicators(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0
);

create index if not exists indicator_sources_indicator_idx
  on analytics.indicator_sources (indicator_id, sort_order);

create table if not exists analytics.municipality_indicator_values (
  release_id uuid not null
    references analytics.dataset_releases(id) on delete cascade,
  municipality_id uuid not null
    references analytics.municipalities(id) on delete cascade,
  indicator_id text not null
    references analytics.indicators(id) on delete cascade,
  year integer not null,
  numeric_value double precision,
  primary key (release_id, municipality_id, indicator_id)
);

create index if not exists municipality_indicator_values_year_idx
  on analytics.municipality_indicator_values (year, indicator_id);

create index if not exists municipality_indicator_values_municipality_idx
  on analytics.municipality_indicator_values (municipality_id, year);

create table if not exists analytics.score_definitions (
  id text primary key,
  canonical_name text not null unique,
  pillar analytics.pillar not null,
  description text,
  component_score_keys text[] not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists analytics.municipality_score_values (
  release_id uuid not null
    references analytics.dataset_releases(id) on delete cascade,
  municipality_id uuid not null
    references analytics.municipalities(id) on delete cascade,
  score_id text not null
    references analytics.score_definitions(id) on delete cascade,
  year integer not null,
  score_value numeric(6,2),
  primary key (release_id, municipality_id, score_id)
);

create index if not exists municipality_score_values_year_idx
  on analytics.municipality_score_values (year, score_id);

create index if not exists municipality_score_values_municipality_idx
  on analytics.municipality_score_values (municipality_id, year);

insert into analytics.score_definitions (
  id,
  canonical_name,
  pillar,
  description,
  component_score_keys,
  display_order
)
values
  (
    'infrastructure_score',
    'Infrastructure Score',
    'infrastructure',
    'Mean of connectivity, accessibility, and transport-risk component scores from the score CSV.',
    array[
      'broadband_internet_score',
      'mobile_internet_score',
      'key_structure_internet_access_score',
      'accessibility_to_hospitals_score',
      'accessibility_to_schools_score',
      'railway_heatwave_score',
      'road_heatwave_score',
      'road_flood_score',
      'railway_flood_score'
    ],
    1
  ),
  (
    'livability_score',
    'Livability Score',
    'livability',
    'Mean of emissions, air quality, deforestation, and emissions-per-area component scores from the score CSV.',
    array[
      'emissions_score',
      'air_quality_score',
      'deforestation_score',
      'emissions_per_area_score'
    ],
    2
  ),
  (
    'prosperity_score',
    'Prosperity Score',
    'prosperity',
    'Mean of luminosity, built-area change, tourism, and agricultural land component scores from the score CSV.',
    array[
      'luminosity_per_capita_score',
      'luminosity_per_area_score',
      'built_area_development_score',
      'tourism_score',
      'agricultural_land_score'
    ],
    3
  )
on conflict (id) do update
set
  canonical_name = excluded.canonical_name,
  pillar = excluded.pillar,
  description = excluded.description,
  component_score_keys = excluded.component_score_keys,
  display_order = excluded.display_order;

alter table analytics.dataset_releases enable row level security;
alter table analytics.municipalities enable row level security;
alter table analytics.municipality_boundaries enable row level security;
alter table analytics.boundary_ingest_issues enable row level security;
alter table analytics.indicators enable row level security;
alter table analytics.indicator_sources enable row level security;
alter table analytics.municipality_indicator_values enable row level security;
alter table analytics.score_definitions enable row level security;
alter table analytics.municipality_score_values enable row level security;

comment on schema analytics is
'Normalized analytics schema for the Nepal LDT public web application.';

comment on table analytics.boundary_ingest_issues is
'Tracks CSV and GeoJSON key mismatches so map coverage can improve without blocking the analytics product.';

comment on column analytics.indicators.raw_admin_column is
'Original column name from the admin CSV before canonical label mapping.';

comment on column analytics.indicators.raw_score_column is
'Original score-component column name from the score CSV when applicable.';
