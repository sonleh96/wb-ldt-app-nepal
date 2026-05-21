# Nepal LDT v1 Implementation Blueprint

## Scope

This repo will become a public, read-only analytics application for Nepal with:

- municipality-level choropleth maps
- 2D and 3D score scatterplots
- municipality drill-down panels
- score driver views
- historical-capable data modeling from day one

The app will use:

- Next.js App Router
- Supabase Postgres + PostGIS
- Vercel deployment
- MapLibre for the mapping layer

Out of scope for v1:

- the AI decision engine from the reference app
- authenticated user workflows
- direct public database access
- automated ingestion pipelines

## Fixed Decisions

- `GPBP_LDT_NPL_scores_admin_2.csv` is canonical for scores
- scores are not recomputed in the app
- indicators contribute directly to pillars
- geography grain is municipality only
- both CSVs are historical-capable via `Year`, even though only `2025` exists today
- Excel indicator labels and descriptions are canonical product metadata
- `Emissions Normalized Score` should be standardized to `Emissions per Area Score`

## Current Data Reality

The CSVs are clean enough to use:

- `757` admin rows
- `757` score rows
- `757` aligned composite keys across admin and score CSVs
- no duplicate composite keys in either CSV
- no infinite numeric values in either CSV

The GeoJSON is still not fully reconciled to the CSVs:

- GeoJSON keys: `771`
- CSV keys: `757`
- CSV-only keys vs GeoJSON: `47`
- GeoJSON-only keys vs CSV: `61`

V1 should not block on that. The map layer should render only the intersection of CSV and GeoJSON keys. Non-map analytics should use the full CSV set.

## Product Shape

Recommended route structure:

- `/`
  - concise project intro
  - direct CTA into analytics
  - short methodology and data freshness summary
- `/analytics`
  - main map-first analytics surface
  - global filters: year, province, score/indicator, highlighted municipality
  - responsive layout with map, comparison panel, and supporting charts
- `/methodology`
  - indicator definitions
  - score definitions
  - sources
  - known data caveats
- `/about`
  - project context and partners

Recommended analytics layout:

- top filter bar
- large choropleth map as the primary visual
- right-side municipality comparison card
- below-the-fold:
  - 2D scatterplot
  - 3D scatterplot
  - score driver charts
  - indicator metadata and sources

## Visual Direction

Do not clone the Streamlit layout. Keep the analytical semantics, but redesign the interface for a web product.

Recommended direction:

- strong map-first page hierarchy
- warm neutral base palette with one restrained accent color
- clear score cards and compact filter controls
- deliberate typography and generous whitespace
- legends and metadata panels that remain visible without overwhelming the chart area

Suggested visual system:

- primary background: off-white or very light stone
- surface cards: slightly tinted neutrals
- map ramps:
  - score views: sequential blue/teal ramp
  - risk views: amber to red ramp
  - positive change views: pale to saturated green
- typography:
  - Geist Sans for interface text
  - Geist Mono for numeric labels, years, and score values

## Architecture

### Runtime Boundaries

- Next.js Server Components fetch data on the server
- Client Components handle map interactions, scatterplot interactions, and local state
- Supabase is accessed from server-side code only in v1
- Vercel serves the public app

Public app does not mean public database. In v1, keep the analytics tables protected behind RLS and query them from server-only code.

If later you want direct public Supabase read access, add curated read-only views and explicit policies for those views instead of exposing base tables.

### Recommended Next.js Structure

```text
src/
  app/
    (marketing)/
      page.tsx
      about/page.tsx
      methodology/page.tsx
    analytics/
      page.tsx
      loading.tsx
      error.tsx
  components/
    analytics/
      analytics-shell.tsx
      analytics-filters.tsx
      municipality-summary-card.tsx
      score-stat-card.tsx
      choropleth-map.tsx
      scatter-2d.tsx
      scatter-3d.tsx
      score-driver-chart.tsx
      indicator-metadata-panel.tsx
    layout/
      app-header.tsx
      site-footer.tsx
  lib/
    supabase/
      server.ts
    data/
      queries.ts
      transforms.ts
      labels.ts
    maps/
      color-scales.ts
      map-style.ts
  types/
    analytics.ts
scripts/
  ingest-nepal-data.ts
  ingest-indicator-metadata.ts
```

### Data Access Strategy

Use server-side query modules in `src/lib/data/queries.ts` to centralize all reads:

- `getAvailableYears()`
- `getAvailableIndicators()`
- `getAvailableScores()`
- `getMapDataset({ year, metric, province })`
- `getMunicipalityProfile({ year, province, district, municipality })`
- `getScatterDataset({ year, xMetric, yMetric, province })`
- `getScoreDrivers({ year, municipalityKey, scoreKey })`

### Caching Strategy

Use cacheable server reads because analytics data changes by release, not by request:

- cache filter options for hours
- cache map datasets by `year + metric + province`
- cache municipality detail payloads by `year + municipality`
- invalidate by dataset release, not by page visit

## Standardized Naming Contract

Treat these labels as canonical in the app and database metadata layer.

| Raw admin CSV | Canonical label |
| --- | --- |
| `Accessibility to Hospitals (%)` | `Accessibility to Health Services (unit: %)` |
| `Accessibility to Schools (%)` | `Accessibility to School Services (unit: %)` |
| `Average Broadband Internet Download Speed (Mbps)` | `Average Broadband Download Speed (unit: megabites per second)` |
| `Average Mobile Internet Download Speed (Mbps)` | `Average Cellular Download Speed (unit: megabites per second)` |
| `Key Structures without Access to Broadband Internet (%)` | `Key Structures without Internet Access (unit: %)` |
| `Average PM25 Concentration (ug/m3)` | `PM 2.5 concentration (unit: ug/m3)` |
| `C02 Emissions per Area (tonnes/km2)` | `CO2-Equivalent Emissions per Area (unit: tonnes/km2)` |

And for scores:

| Raw score CSV | Canonical label |
| --- | --- |
| `Emissions Normalized Score` | `Emissions per Area Score` |

Database field names should use machine-safe identifiers, while UI labels should use the canonical labels above.

## Pillar Definitions

### Infrastructure Score

Derived from stored component scores:

- Broadband Internet Score
- Mobile Internet Score
- Key Structure Internet Access Score
- Accessibility to Hospitals Score
- Accessibility to Schools Score
- Railway Heatwave Score
- Road Heatwave Score
- Road Flood Score
- Railway Flood Score

### Livability Score

Derived from stored component scores:

- Emissions Score
- Air Quality Score
- Deforestation Score
- Emissions per Area Score

### Prosperity Score

Derived from stored component scores:

- Luminosity per Capita Score
- Luminosity per Area Score
- Built Area Development Score
- Tourism Score
- Agricultural Land Score

Note: these are equal-weight averages in the current score CSV.

## Supabase Data Model

Use a normalized analytics schema rather than storing only wide CSV tables.

Core entities:

- `dataset_releases`
  - one record per published data release
- `municipalities`
  - one municipality per `province + district + municipality`
- `municipality_boundaries`
  - geometry for map-ready municipalities only
- `indicators`
  - canonical metadata from the Excel and source mapping
- `indicator_sources`
  - displayable source badges
- `municipality_indicator_values`
  - normalized numeric indicator values by year and municipality
- `score_definitions`
  - canonical pillar definitions
- `municipality_score_values`
  - normalized score values by year and municipality
- `boundary_ingest_issues`
  - unresolved CSV vs GeoJSON mismatches

Why normalized instead of wide:

- historical growth is easy
- metadata and sources live beside indicators cleanly
- queries for maps and drill-downs become explicit
- future pipeline automation is easier

## Ingestion Plan

### Phase 1: Metadata

Load indicator metadata from `data/indicators_table.xlsx` and the manual source mapping.

### Phase 2: Geography

Load municipalities from the aligned CSV keys.

Create a canonical municipality key:

```text
province + district + municipality
```

Persist the original text values and a normalized slug for URLs.

### Phase 3: Boundary Load

Load GeoJSON rows only where the composite key exists in the CSV-backed municipality set.

Store unmatched GeoJSON keys in `boundary_ingest_issues`.
Store unmatched CSV keys in `boundary_ingest_issues`.

### Phase 4: Indicator Values

Unpivot the admin CSV into normalized indicator rows:

- one row per `dataset_release + municipality + indicator`

### Phase 5: Score Values

Unpivot the score CSV into normalized score rows:

- one row per `dataset_release + municipality + score`

## Map Strategy

Use MapLibre with municipality polygons from Supabase.

V1 map behavior:

- render only municipalities that exist in both:
  - normalized municipality table
  - municipality boundaries table
- expose coverage counts in the UI
- if a selected municipality lacks geometry, still show its charts and metadata with a "map unavailable" state

Recommended map payload shape:

```ts
type MapFeatureRow = {
  municipalityId: string;
  municipality: string;
  district: string;
  province: string;
  year: number;
  metricKey: string;
  metricLabel: string;
  metricValue: number | null;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
};
```

## Scatterplot Strategy

V1 scatterplots should use the score CSV, not recomputed values.

2D scatter:

- X axis: any pillar score
- Y axis: any pillar score
- optional province filter
- highlighted municipality state

3D scatter:

- fixed axes:
  - Prosperity Score
  - Infrastructure Score
  - Livability Score

## Score Driver Strategy

Because the score CSV already contains the pillar components, the driver charts can be built directly from stored score components instead of recomputing from raw indicators.

For each pillar:

- show municipality component scores
- show national average component scores
- display delta from national average
- sort components by absolute delta

This keeps v1 faithful to the stored score data and avoids hidden calculation drift.

## Methodology Page Contents

The methodology page should include:

- what each pillar means
- all indicator descriptions from the Excel
- directionality from the Excel
- source badges from the manual mapping
- known limitations:
  - current dataset is one-year only
  - score CSV is authoritative
  - map layer currently uses only CSV/GeoJSON intersection

## Suggested Delivery Sequence

### Milestone 1: Foundation

- scaffold Next.js app
- wire Supabase server client
- add initial migration
- ingest municipalities and scores

### Milestone 2: Data and API

- ingest indicator metadata
- ingest indicator values
- ingest boundaries intersection
- implement server query layer

### Milestone 3: Analytics UI

- build analytics shell
- choropleth map
- municipality summary panel
- 2D and 3D scatterplots

### Milestone 4: Methodology and Polish

- methodology page
- metadata panel
- source badges
- loading states
- responsive layout tuning

## Immediate Build Order

If implementation starts now, the most efficient order is:

1. scaffold the Next.js project in this repo
2. add Supabase migration and environment plumbing
3. implement the ingestion scripts against the standardized naming contract
4. build server-side data queries
5. build the map-first analytics page

