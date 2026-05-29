# Sprint 4: QA and Launch Readiness

**Goal:** Validate the complete multi-country release across routes, analytics, data integrity, content, and AI, then prepare for production launch.

**Stakeholder Outcome:** A release candidate is ready for stakeholder review and production rollout.

## Scope

- Run end-to-end verification for Nepal, Zambia, and Serbia.
- Validate analytics correctness, route behavior, content, and AI outputs.
- Resolve defects and prepare release documentation.

## Technical Work

- Run build and lint checks on the full app.
- Verify route behavior:
  - `/`
  - `/nepal`
  - `/zambia`
  - `/serbia`
  - `/nepal/analytics`
  - `/zambia/analytics`
  - `/serbia/analytics`
  - `/analytics` redirect
- Verify data behavior:
  - country-specific filters
  - municipality drill-down
  - scatterplots
  - score drivers
  - map rendering
- Verify AI behavior:
  - Nepal compatibility
  - country-specific plan-document selection
  - cache isolation by country
  - country-specific web-context search prompts
- Update release notes and operator-facing deployment notes.

## Dependencies

- Sprints 1 through 3 complete.
- Zambia and Serbia staging data loaded.
- AI document sources loaded for any country expected to ship with AI.

## Acceptance Criteria

- Nepal remains fully functional after all multi-country changes.
- Zambia and Serbia work end-to-end in staging.
- No cross-country data leakage is observed.
- AI outputs are generated against the correct country context.
- Stakeholder review passes for all three countries.
- Release materials are ready for deployment.

## Risks

- Late data quality issues could delay launch even if the platform work is complete.
- AI output quality may expose source-document gaps late in the cycle.
- Performance may differ by country depending on municipality count and geometry size.
