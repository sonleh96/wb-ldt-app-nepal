create table if not exists analytics.sng_display_table (
  municipality text not null,
  district text not null,
  province text not null,
  population bigint,
  total_land_area_km2 double precision,
  infrastructure_score numeric(6,2),
  livability_score numeric(6,2),
  prosperity_score numeric(6,2),
  pil_aggregate numeric(6,2),
  has_development_strategy boolean not null default false,
  strategy_level text,
  link text,
  source_file_name text not null default 'sng_display_table.csv',
  updated_at timestamptz not null default now(),
  primary key (municipality, district, province)
);

create index if not exists sng_display_table_population_idx
  on analytics.sng_display_table (population);

create index if not exists sng_display_table_province_idx
  on analytics.sng_display_table (province);

create index if not exists sng_display_table_municipality_idx
  on analytics.sng_display_table (municipality);

alter table analytics.sng_display_table enable row level security;

revoke all on table analytics.sng_display_table from anon, authenticated;
grant all on table analytics.sng_display_table to service_role;

comment on table analytics.sng_display_table is
'Display table for Nepal SNG municipality-level metrics, loaded from data/sng_display_table.csv.';
