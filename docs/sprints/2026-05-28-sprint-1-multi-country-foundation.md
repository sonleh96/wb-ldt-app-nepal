# Sprint 1: Multi-Country Foundation

**Goal:** Convert the Nepal-only app into a shared multi-country platform without breaking Nepal.

**Stakeholder Outcome:** The platform can support Nepal, Zambia, and Serbia in one architecture, with Nepal still functioning throughout the transition.

## Scope

- Add `country_code` as a first-class field across the core analytics schema.
- Create a shared country registry for `NPL`, `ZMB`, and `SRB`.
- Refactor the analytics route from one shared `/analytics` page to country-scoped routing.
- Make the main query layer and fallback loaders country-aware.

## Technical Work

- Create a Supabase migration that adds `country_code` to:
  - `dataset_releases`
  - `municipalities`
  - `boundary_ingest_issues`
  - `ai_document_contexts`
  - `ai_stage_cache`
  - `plan_document_sources`
  - `province_plan_sources`
  - `sng_display_table`
- Backfill all existing rows as `NPL`.
- Replace single-country uniqueness with country-scoped uniqueness.
- Create a shared country registry module with slug, code, and display name.
- Add country-aware types to the analytics type layer.
- Move analytics routing to `src/app/[country]/analytics/*`.
- Redirect legacy `/analytics` to `/nepal/analytics`.
- Make the analytics query layer load:
  - country-scoped releases
  - country-scoped municipalities
  - country-scoped fallback JSON
  - country-scoped map GeoJSON

## Dependencies

- None. This sprint is the platform prerequisite for all later work.

## Acceptance Criteria

- Nepal still loads correctly at `/nepal/analytics`.
- `/analytics` redirects to `/nepal/analytics`.
- Unknown country slugs return `404`.
- All existing database rows are backfilled to `NPL`.
- No Zambia or Serbia data can leak into Nepal filters or analytics queries.

## Risks

- Breaking Nepal while changing unique constraints and route structure.
- Missing one or more country filters in the query layer or AI cache paths.
