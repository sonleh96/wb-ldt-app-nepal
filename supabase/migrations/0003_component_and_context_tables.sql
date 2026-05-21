create table if not exists analytics.score_components (
  id text primary key,
  canonical_name text not null unique,
  pillar analytics.pillar not null,
  parent_score_id text not null
    references analytics.score_definitions(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists score_components_parent_idx
  on analytics.score_components (parent_score_id, display_order);

create table if not exists analytics.municipality_score_component_values (
  release_id uuid not null
    references analytics.dataset_releases(id) on delete cascade,
  municipality_id uuid not null
    references analytics.municipalities(id) on delete cascade,
  component_id text not null
    references analytics.score_components(id) on delete cascade,
  year integer not null,
  score_value numeric(6,2),
  primary key (release_id, municipality_id, component_id)
);

create index if not exists municipality_score_component_values_year_idx
  on analytics.municipality_score_component_values (year, component_id);

create index if not exists municipality_score_component_values_municipality_idx
  on analytics.municipality_score_component_values (municipality_id, year);

create table if not exists analytics.municipality_context_values (
  release_id uuid not null
    references analytics.dataset_releases(id) on delete cascade,
  municipality_id uuid not null
    references analytics.municipalities(id) on delete cascade,
  year integer not null,
  population bigint,
  total_land_area_km2 double precision,
  total_road_length_km double precision,
  total_railway_length_km double precision,
  road_flood_risk_km double precision,
  road_heatwave_risk_km double precision,
  railway_flood_risk_km double precision,
  railway_heatwave_risk_km double precision,
  primary key (release_id, municipality_id)
);

create index if not exists municipality_context_values_year_idx
  on analytics.municipality_context_values (year);

insert into analytics.score_components (
  id,
  canonical_name,
  pillar,
  parent_score_id,
  display_order
)
values
  ('broadband_internet_score', 'Broadband Internet Score', 'infrastructure', 'infrastructure_score', 1),
  ('mobile_internet_score', 'Mobile Internet Score', 'infrastructure', 'infrastructure_score', 2),
  ('key_structure_internet_access_score', 'Key Structure Internet Access Score', 'infrastructure', 'infrastructure_score', 3),
  ('accessibility_to_hospitals_score', 'Accessibility to Hospitals Score', 'infrastructure', 'infrastructure_score', 4),
  ('accessibility_to_schools_score', 'Accessibility to Schools Score', 'infrastructure', 'infrastructure_score', 5),
  ('railway_heatwave_score', 'Railway Heatwave Score', 'infrastructure', 'infrastructure_score', 6),
  ('road_heatwave_score', 'Road Heatwave Score', 'infrastructure', 'infrastructure_score', 7),
  ('road_flood_score', 'Road Flood Score', 'infrastructure', 'infrastructure_score', 8),
  ('railway_flood_score', 'Railway Flood Score', 'infrastructure', 'infrastructure_score', 9),
  ('emissions_score', 'Emissions Score', 'livability', 'livability_score', 1),
  ('air_quality_score', 'Air Quality Score', 'livability', 'livability_score', 2),
  ('deforestation_score', 'Deforestation Score', 'livability', 'livability_score', 3),
  ('emissions_per_area_score', 'Emissions per Area Score', 'livability', 'livability_score', 4),
  ('luminosity_per_capita_score', 'Luminosity per Capita Score', 'prosperity', 'prosperity_score', 1),
  ('luminosity_per_area_score', 'Luminosity per Area Score', 'prosperity', 'prosperity_score', 2),
  ('built_area_development_score', 'Built Area Development Score', 'prosperity', 'prosperity_score', 3),
  ('tourism_score', 'Tourism Score', 'prosperity', 'prosperity_score', 4),
  ('agricultural_land_score', 'Agricultural Land Score', 'prosperity', 'prosperity_score', 5)
on conflict (id) do update
set
  canonical_name = excluded.canonical_name,
  pillar = excluded.pillar,
  parent_score_id = excluded.parent_score_id,
  display_order = excluded.display_order;

alter table analytics.score_components enable row level security;
alter table analytics.municipality_score_component_values enable row level security;
alter table analytics.municipality_context_values enable row level security;

comment on table analytics.score_components is
'Canonical component scores that feed the three municipality pillar scores.';

comment on table analytics.municipality_score_component_values is
'Authoritative per-municipality component scores loaded from the score CSV.';

comment on table analytics.municipality_context_values is
'Per-municipality context fields used in the summary card and map-adjacent analytics panels.';
