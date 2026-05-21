create table if not exists analytics.ai_document_contexts (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('province_plan', 'national_plan')),
  title text not null,
  province text,
  source_url_or_path text not null,
  content_mode text not null default 'full_text' check (content_mode in ('full_text', 'chunked_text')),
  extracted_text text not null,
  passages jsonb not null default '[]'::jsonb,
  chunks jsonb not null default '[]'::jsonb,
  extraction_metadata jsonb not null default '{}'::jsonb,
  content_fingerprint text not null,
  extraction_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, province, source_url_or_path, content_fingerprint, extraction_version)
);

create index if not exists ai_document_contexts_lookup_idx
  on analytics.ai_document_contexts (source_type, province, extraction_version);

create table if not exists analytics.ai_stage_cache (
  id uuid primary key default gen_random_uuid(),
  stage_name text not null check (
    stage_name in (
      'indicator_narrative',
      'province_plan_context',
      'national_plan_context',
      'web_context_search',
      'plan_alignment',
      'swot_analysis',
      'investment_recommendations'
    )
  ),
  release_key text not null,
  year integer not null,
  municipality_id uuid not null references analytics.municipalities(id) on delete cascade,
  province text not null,
  score_id text not null references analytics.score_definitions(id) on delete cascade,
  model_name text not null,
  prompt_version text not null,
  invalidation_version text not null default 'v1',
  input_fingerprint text not null,
  prompt_hash text not null,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  rendered_output text,
  structured_output jsonb not null default '{}'::jsonb,
  source_references jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (
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
  )
);

create index if not exists ai_stage_cache_lookup_idx
  on analytics.ai_stage_cache (
    stage_name,
    municipality_id,
    score_id,
    year,
    release_key
  );

create or replace function analytics.touch_ai_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_ai_document_contexts_updated_at on analytics.ai_document_contexts;
create trigger touch_ai_document_contexts_updated_at
before update on analytics.ai_document_contexts
for each row
execute function analytics.touch_ai_updated_at();

drop trigger if exists touch_ai_stage_cache_updated_at on analytics.ai_stage_cache;
create trigger touch_ai_stage_cache_updated_at
before update on analytics.ai_stage_cache
for each row
execute function analytics.touch_ai_updated_at();

grant usage on schema analytics to anon, authenticated, service_role;
grant all privileges on analytics.ai_document_contexts to anon, authenticated, service_role;
grant all privileges on analytics.ai_stage_cache to anon, authenticated, service_role;
