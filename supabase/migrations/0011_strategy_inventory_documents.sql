create table if not exists analytics.strategy_inventory_documents (
  id uuid primary key default gen_random_uuid(),
  country_code text not null
    references analytics.countries(country_code),
  lsg_id text not null,
  lsg_name text not null,
  lsg_name_local text,
  region_name text,
  document_key text not null,
  document_type text not null
    check (document_type in ('strategy', 'budget', 'plan', 'other')),
  document_title text,
  publication_year integer
    check (publication_year is null or publication_year between 1900 and 2100),
  valid_from_year integer
    check (valid_from_year is null or valid_from_year between 1900 and 2100),
  valid_to_year integer
    check (valid_to_year is null or valid_to_year between 1900 and 2100),
  source_url text,
  source_status text not null
    check (source_status in ('found', 'missing', 'not_available', 'needs_validation')),
  language text
    check (language is null or language in ('sr', 'en', 'sr_en', 'unknown')),
  translation_status text not null
    check (translation_status in ('not_required', 'translated', 'needs_translation', 'partial', 'unknown')),
  parsing_status text not null
    check (parsing_status in ('not_started', 'parsed', 'failed', 'needs_review')),
  ai_ready boolean not null default false,
  comprehensiveness_score numeric(5,2)
    check (
      comprehensiveness_score is null
      or (comprehensiveness_score >= 0 and comprehensiveness_score <= 100)
    ),
  notes text,
  source_dataset_name text not null default 'strategy_inventory',
  is_active boolean not null default true,
  last_updated date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_code, document_key)
);

create index if not exists strategy_inventory_documents_country_active_idx
  on analytics.strategy_inventory_documents (country_code, is_active, lsg_name);

create index if not exists strategy_inventory_documents_lsg_idx
  on analytics.strategy_inventory_documents (country_code, lsg_id);

create index if not exists strategy_inventory_documents_readiness_idx
  on analytics.strategy_inventory_documents (
    country_code,
    source_status,
    translation_status,
    parsing_status,
    ai_ready
  );

create index if not exists strategy_inventory_documents_publication_year_idx
  on analytics.strategy_inventory_documents (country_code, publication_year);

drop trigger if exists touch_strategy_inventory_documents_updated_at
  on analytics.strategy_inventory_documents;

create trigger touch_strategy_inventory_documents_updated_at
before update on analytics.strategy_inventory_documents
for each row
execute function analytics.touch_ai_updated_at();

alter table analytics.strategy_inventory_documents enable row level security;

revoke all on table analytics.strategy_inventory_documents from anon, authenticated;
grant all on table analytics.strategy_inventory_documents to service_role;

comment on table analytics.strategy_inventory_documents is
'Country-aware inventory of local strategy, budget, plan, and related documents used by the Strategy Inventory Dashboard.';

comment on column analytics.strategy_inventory_documents.document_key is
'Stable upsert key derived from LSG, document type, title, and source URL.';
