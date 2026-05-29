# Sprint 2: Zambia and Serbia Data Onboarding

**Goal:** Generalize the local build and Supabase ingest pipeline, then onboard Zambia and Serbia into the shared platform.

**Stakeholder Outcome:** Zambia and Serbia analytics run in staging using the same core platform as Nepal.

## Scope

- Replace Nepal-only data builders with a shared country builder contract.
- Generalize local artifact generation and Supabase ingest scripts.
- Add Zambia and Serbia country datasets and boundaries.
- Generate country-specific fallback assets for both countries.

## Technical Work

- Split the Nepal builder into:
  - a shared country data interface
  - a Nepal adapter
  - a Zambia adapter
  - a Serbia adapter
- Update local generation so it can build:
  - one country
  - all countries
- Update Supabase ingest scripts to accept a country input and write `country_code`.
- Update boundary ingest scripts to accept a country input.
- Update plan-source and optional SNG-style ingest scripts to accept a country input.
- Add source data for Zambia and Serbia:
  - admin CSV
  - score CSV
  - boundary GeoJSON
  - indicator metadata mappings
- Generate fallback artifacts:
  - `src/generated/zambia/analytics-data.json`
  - `src/generated/serbia/analytics-data.json`
  - `public/data/zambia/municipalities.geojson`
  - `public/data/serbia/municipalities.geojson`

## Dependencies

- Sprint 1 schema and route foundation must be complete first.

## Acceptance Criteria

- Zambia analytics loads successfully in staging.
- Serbia analytics loads successfully in staging.
- Country-specific fallback files are generated in country-specific paths.
- Admin CSV, score CSV, and geometry keys reconcile to an accepted coverage level.
- No duplicate composite keys exist within a country release.

## Risks

- Serbia or Zambia may not match Nepal's current metric contract cleanly.
- Boundary reconciliation may take longer than the app refactor.
- Country source files may require bespoke normalization logic.
