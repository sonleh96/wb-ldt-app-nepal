alter table if exists analytics.ai_stage_cache
  drop constraint if exists ai_stage_cache_stage_name_check;

alter table if exists analytics.ai_stage_cache
  add constraint ai_stage_cache_stage_name_check
  check (
    stage_name in (
      'indicator_narrative',
      'province_plan_context',
      'national_plan_context',
      'web_context_search',
      'plan_alignment',
      'swot_analysis',
      'investment_recommendations'
    )
  );
