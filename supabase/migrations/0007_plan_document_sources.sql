create table if not exists analytics.plan_document_sources (
  id uuid primary key default gen_random_uuid(),
  country text not null default 'Nepal',
  source_sheet text not null default 'Nepal',
  plan_level text not null check (plan_level in ('province', 'national')),
  province text,
  title text not null,
  link text not null,
  document_type text,
  score_theme text,
  notes text,
  priority integer not null default 4,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (plan_level = 'province' and province is not null)
    or (plan_level = 'national')
  )
);

create unique index if not exists plan_document_sources_unique_idx
  on analytics.plan_document_sources (country, source_sheet, plan_level, coalesce(province, ''), link);

create index if not exists plan_document_sources_lookup_idx
  on analytics.plan_document_sources (country, source_sheet, plan_level, province, is_active, priority);

drop trigger if exists touch_plan_document_sources_updated_at on analytics.plan_document_sources;
create trigger touch_plan_document_sources_updated_at
before update on analytics.plan_document_sources
for each row
execute function analytics.touch_ai_updated_at();

grant usage on schema analytics to anon, authenticated, service_role;
grant all privileges on analytics.plan_document_sources to anon, authenticated, service_role;

do $$
begin
  if to_regclass('analytics.province_plan_sources') is not null then
    insert into analytics.plan_document_sources (
      country,
      source_sheet,
      plan_level,
      province,
      title,
      link,
      document_type,
      score_theme,
      notes,
      priority,
      is_active
    )
    select
      country,
      source_sheet,
      'province',
      province,
      province || ' provincial development plan',
      link,
      'development_plan',
      null,
      notes,
      priority,
      true
    from analytics.province_plan_sources
    on conflict do nothing;
  end if;
end $$;

insert into analytics.plan_document_sources (
  country,
  source_sheet,
  plan_level,
  province,
  title,
  link,
  document_type,
  score_theme,
  notes,
  priority,
  is_active
)
values (
  'Nepal',
  'Nepal',
  'national',
  null,
  'Nepal National Plan (Sixteenth Plan)',
  'http://elibrary.moest.gov.np/bitstream/123456789/308/1/16.pdf',
  'development_plan',
  null,
  'Seeded from the local national-plan.pdf migration to Supabase-backed plan sources.',
  1,
  true
)
on conflict do nothing;
