create table if not exists analytics.countries (
  country_code text primary key,
  country_name text not null,
  country_slug text not null unique,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into analytics.countries (
  country_code,
  country_name,
  country_slug,
  is_active,
  display_order
)
values
  ('NPL', 'Nepal', 'nepal', true, 1),
  ('ZMB', 'Zambia', 'zambia', true, 2),
  ('SRB', 'Serbia', 'serbia', true, 3)
on conflict (country_code) do update
set
  country_name = excluded.country_name,
  country_slug = excluded.country_slug,
  is_active = excluded.is_active,
  display_order = excluded.display_order;

alter table analytics.dataset_releases
  add column if not exists country_code text;
alter table analytics.municipalities
  add column if not exists country_code text;
alter table analytics.boundary_ingest_issues
  add column if not exists country_code text;
alter table analytics.ai_document_contexts
  add column if not exists country_code text;
alter table analytics.ai_stage_cache
  add column if not exists country_code text;
alter table analytics.plan_document_sources
  add column if not exists country_code text;
alter table analytics.province_plan_sources
  add column if not exists country_code text;
alter table analytics.sng_display_table
  add column if not exists country_code text;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'analytics'
      and table_name = 'dataset_releases'
      and column_name = 'country_code'
  ) then
    raise exception 'Missing analytics.dataset_releases.country_code after add-column phase.';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'analytics'
      and table_name = 'municipalities'
      and column_name = 'country_code'
  ) then
    raise exception 'Missing analytics.municipalities.country_code after add-column phase.';
  end if;
end $$;

update analytics.dataset_releases set country_code = 'NPL' where country_code is null;
update analytics.municipalities set country_code = 'NPL' where country_code is null;
update analytics.boundary_ingest_issues set country_code = 'NPL' where country_code is null;
update analytics.ai_document_contexts set country_code = 'NPL' where country_code is null;
update analytics.ai_stage_cache set country_code = 'NPL' where country_code is null;
update analytics.plan_document_sources set country_code = 'NPL' where country_code is null;
update analytics.province_plan_sources set country_code = 'NPL' where country_code is null;
update analytics.sng_display_table set country_code = 'NPL' where country_code is null;

alter table analytics.dataset_releases
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.municipalities
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.boundary_ingest_issues
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.ai_document_contexts
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.ai_stage_cache
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.plan_document_sources
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.province_plan_sources
  alter column country_code set default 'NPL',
  alter column country_code set not null;
alter table analytics.sng_display_table
  alter column country_code set default 'NPL',
  alter column country_code set not null;

do $$
begin
  alter table analytics.dataset_releases
    add constraint dataset_releases_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.municipalities
    add constraint municipalities_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.boundary_ingest_issues
    add constraint boundary_ingest_issues_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.ai_document_contexts
    add constraint ai_document_contexts_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.ai_stage_cache
    add constraint ai_stage_cache_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.plan_document_sources
    add constraint plan_document_sources_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.province_plan_sources
    add constraint province_plan_sources_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.sng_display_table
    add constraint sng_display_table_country_code_fkey
    foreign key (country_code) references analytics.countries(country_code);
exception when duplicate_object then null;
end $$;

alter table analytics.dataset_releases
  drop constraint if exists dataset_releases_release_key_key;
alter table analytics.municipalities
  drop constraint if exists municipalities_composite_key_key;
alter table analytics.municipalities
  drop constraint if exists municipalities_province_district_municipality_key;
alter table analytics.ai_document_contexts
  drop constraint if exists ai_document_contexts_source_type_province_source_url_or_path_conte_key;
alter table analytics.ai_stage_cache
  drop constraint if exists ai_stage_cache_stage_name_release_key_year_municipality_id_province_key;
alter table analytics.province_plan_sources
  drop constraint if exists province_plan_sources_country_source_sheet_province_link_key;
alter table analytics.sng_display_table
  drop constraint if exists sng_display_table_pkey;

drop index if exists analytics.plan_document_sources_unique_idx;
drop index if exists analytics.province_plan_sources_country_source_sheet_province_link_key;

do $$
begin
  alter table analytics.dataset_releases
    add constraint dataset_releases_country_release_key_key
    unique (country_code, release_key);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.municipalities
    add constraint municipalities_country_composite_key_key
    unique (country_code, composite_key);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.municipalities
    add constraint municipalities_country_admin_key
    unique (country_code, province, district, municipality);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.ai_document_contexts
    add constraint ai_document_contexts_country_source_key
    unique (
      country_code,
      source_type,
      province,
      source_url_or_path,
      content_fingerprint,
      extraction_version
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.ai_stage_cache
    add constraint ai_stage_cache_country_stage_key
    unique (
      country_code,
      stage_name,
      release_key,
      year,
      municipality_id,
      province,
      score_id,
      model_name,
      prompt_version,
      invalidation_version,
      input_fingerprint
    );
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table analytics.sng_display_table
    add constraint sng_display_table_pkey
    primary key (country_code, municipality, district, province);
exception when duplicate_object then null;
end $$;

create unique index if not exists plan_document_sources_unique_idx
  on analytics.plan_document_sources (
    country_code,
    source_sheet,
    plan_level,
    coalesce(province, ''),
    link
  );

create unique index if not exists province_plan_sources_country_source_sheet_province_link_key
  on analytics.province_plan_sources (
    country_code,
    source_sheet,
    province,
    link
  );

drop index if exists analytics.municipalities_province_idx;
drop index if exists analytics.municipalities_district_idx;
drop index if exists analytics.municipalities_slug_idx;
drop index if exists analytics.plan_document_sources_lookup_idx;
drop index if exists analytics.province_plan_sources_lookup_idx;

create index if not exists dataset_releases_country_year_idx
  on analytics.dataset_releases (country_code, year, is_active);

create index if not exists municipalities_country_province_idx
  on analytics.municipalities (country_code, province);

create index if not exists municipalities_country_district_idx
  on analytics.municipalities (country_code, district);

create index if not exists municipalities_country_slug_idx
  on analytics.municipalities (
    country_code,
    province_slug,
    district_slug,
    municipality_slug
  );

create index if not exists ai_stage_cache_country_lookup_idx
  on analytics.ai_stage_cache (
    country_code,
    stage_name,
    municipality_id,
    score_id,
    year,
    release_key
  );

create index if not exists plan_document_sources_country_lookup_idx
  on analytics.plan_document_sources (
    country_code,
    plan_level,
    province,
    is_active,
    priority
  );

create index if not exists province_plan_sources_country_lookup_idx
  on analytics.province_plan_sources (
    country_code,
    source_sheet,
    province,
    priority
  );

comment on table analytics.countries is
'Country registry for the multi-country Local Development Tracker platform.';
