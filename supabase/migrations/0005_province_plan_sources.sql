create table if not exists analytics.province_plan_sources (
  id uuid primary key default gen_random_uuid(),
  country text not null default 'Nepal',
  source_sheet text not null default 'Nepal',
  province text not null,
  link text not null,
  notes text,
  priority integer not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country, source_sheet, province, link)
);

create index if not exists province_plan_sources_lookup_idx
  on analytics.province_plan_sources (country, source_sheet, province, priority);

drop trigger if exists touch_province_plan_sources_updated_at on analytics.province_plan_sources;
create trigger touch_province_plan_sources_updated_at
before update on analytics.province_plan_sources
for each row
execute function analytics.touch_ai_updated_at();

grant usage on schema analytics to anon, authenticated, service_role;
grant all privileges on analytics.province_plan_sources to anon, authenticated, service_role;
