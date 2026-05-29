# Sprint 3: Country Experience and AI Enablement

**Goal:** Turn the platform from technically multi-country into a coherent public product for Nepal, Zambia, and Serbia, with AI enabled where documents are ready.

**Stakeholder Outcome:** Each country has a complete public-facing experience, and the AI workflow can operate on country-specific planning documents.

## Scope

- Replace placeholder Serbia and Zambia pages with real country experiences.
- Make all shared UI copy country-aware.
- Generalize the AI pipeline, prompts, cache keys, and planning-document loaders by country.
- Enable AI for Zambia and Serbia where planning documents are available.

## Technical Work

- Upgrade the country selector and country landing-page flow.
- Replace Nepal-only strings in analytics, methodology, and supporting content.
- Generalize optional country-home modules such as the Nepal SNG section.
- Add `countryCode` to AI request payloads, AI pipeline context, and AI cache lookups.
- Make AI prompt generation use the selected country name.
- Make plan-document loading filter by `country_code`.
- Make web-context search queries include the selected country.
- Ensure AI stage cache keys are unique across countries.

## Dependencies

- Sprint 1 complete.
- Sprint 2 complete for the countries that need to go live.
- Country planning documents available for AI enablement.

## Acceptance Criteria

- `/nepal`, `/zambia`, and `/serbia` each present a real landing experience.
- Shared analytics copy reflects the selected country rather than Nepal.
- AI payloads and cache keys are country-aware.
- Nepal AI still works after the refactor.
- Zambia and Serbia AI works if their planning documents have been loaded.

## Risks

- Planning documents may not be ready or parse cleanly for all countries.
- One or both countries may need different homepage summary modules than Nepal.
- Prompt quality may vary by country depending on source-document coverage.
