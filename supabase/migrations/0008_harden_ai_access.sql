alter table if exists analytics.ai_document_contexts enable row level security;
alter table if exists analytics.ai_stage_cache enable row level security;
alter table if exists analytics.plan_document_sources enable row level security;

revoke all privileges on table analytics.ai_document_contexts from anon, authenticated;
revoke all privileges on table analytics.ai_stage_cache from anon, authenticated;
revoke all privileges on table analytics.plan_document_sources from anon, authenticated;

grant all privileges on table analytics.ai_document_contexts to service_role;
grant all privileges on table analytics.ai_stage_cache to service_role;
grant all privileges on table analytics.plan_document_sources to service_role;
