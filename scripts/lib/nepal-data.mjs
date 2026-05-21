import fs from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";
import proj4 from "proj4";
import XLSX from "xlsx";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const DATA_DIR = path.join(ROOT_DIR, "data");

const ADMIN_FILE = "GPBP_LDT_NPL_admin_2.csv";
const SCORE_FILE = "GPBP_LDT_NPL_scores_admin_2.csv";
const GEOJSON_FILE = "GPBP_LDT_NPL_admin_2_regions.json";
const INDICATORS_FILE = "indicators_table.xlsx";
const GEOJSON_SIMPLIFY_TOLERANCE = 0.0008;

proj4.defs(
  "EPSG:6933",
  "+proj=cea +lat_ts=30 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);

export const ADMIN_CANONICAL_MAPPINGS = {
  "Accessibility to Hospitals (%)": "Accessibility to Health Services (unit: %)",
  "Accessibility to Schools (%)": "Accessibility to School Services (unit: %)",
  "Average Broadband Internet Download Speed (Mbps)":
    "Average Broadband Download Speed (unit: megabites per second)",
  "Average Mobile Internet Download Speed (Mbps)":
    "Average Cellular Download Speed (unit: megabites per second)",
  "Key Structures without Access to Broadband Internet (%)":
    "Key Structures without Internet Access (unit: %)",
  "Average PM25 Concentration (ug/m3)": "PM 2.5 concentration (unit: µg/m3)",
  "C02 Emissions per Area (tonnes/km2)":
    "CO2-Equivalent Emissions per Area (unit: tonnes/km2)",
  "CO2-Equivalent Emissions (tonnes)": "CO2-Equivalent Emissions (tonnes)",
  "Change in Build Area (%)": "Change in Build Area (%)",
  "Change in Forest Area (%)": "Change in Forest Area (%)",
  "Total Land Area for Agricultural Use (km2)":
    "Total Land Area for Agricultural Use (km2)",
  "Number of Tourism POIs": "Number of Tourism POIs",
  "Nighttime Luminosity": "Nighttime Luminosity (unit: nWatts/(cm2 x sr)",
  "Luminosity per Capita": "Luminosity per Capita (unit: nWatts/(cm2 x sr x person))",
  "Luminosity per Area": "Luminosity per Area (unit: nWatts/(cm2 x sr x km2))",
  "Road Flood Risk (%)": "Road Flood Risk (unit: %)",
  "Road Heatwave Risk (%)": "Road Heatwave Risk (unit: %)",
  "Railway Flood Risk (%)": "Railway Flood Risk (unit: %)",
  "Railway Heatwave Risk (%)": "Railway Heatwave Risk (unit: %)",
};

export const SCORE_CANONICAL_MAPPINGS = {
  "Broadband Internet Score": "Broadband Internet Score",
  "Mobile Internet Score": "Mobile Internet Score",
  "Key Structure Internet Access Score": "Key Structure Internet Access Score",
  "Accessibility to Hospitals Score": "Accessibility to Hospitals Score",
  "Accessibility to Schools Score": "Accessibility to Schools Score",
  "Railway Heatwave Score": "Railway Heatwave Score",
  "Road Heatwave Score": "Road Heatwave Score",
  "Road Flood Score": "Road Flood Score",
  "Railway Flood Score": "Railway Flood Score",
  "Emissions Normalized Score": "Emissions per Area Score",
  "Air Quality Score": "Air Quality Score",
  "Deforestation Score": "Deforestation Score",
  "Emissions Score": "Emissions Score",
  "Luminosity per Capita Score": "Luminosity per Capita Score",
  "Luminosity per Area Score": "Luminosity per Area Score",
  "Built Area Development Score": "Built Area Development Score",
  "Tourism Score": "Tourism Score",
  "Agricultural Land Score": "Agricultural Land Score",
  "Infrastructure Score": "Infrastructure Score",
  "Livability Score": "Livability Score",
  "Prosperity Score": "Prosperity Score",
};

const SOURCE_MAPPINGS = {
  "PM 2.5 concentration (unit: µg/m3)": [
    {
      label: "OpenWeatherMaps Air Pollution",
      url: "https://openweathermap.org/api/air-pollution",
    },
  ],
  "Accessibility to Health Services (unit: %)": [
    {
      label: "OSM Openrouteservice",
      url: "https://wiki.openstreetmap.org/wiki/Openrouteservice",
    },
    {
      label: "WorldPop New Global 2 Population Data",
      url: "https://hub.worldpop.org/project/categories?id=3",
    },
  ],
  "Accessibility to School Services (unit: %)": [
    {
      label: "OSM Openrouteservice",
      url: "https://wiki.openstreetmap.org/wiki/Openrouteservice",
    },
    {
      label: "WorldPop New Global 2 Population Data",
      url: "https://hub.worldpop.org/project/categories?id=3",
    },
  ],
  "Average Broadband Download Speed (unit: megabites per second)": [
    {
      label: "Ookla Speedtest Global Performance",
      url: "https://registry.opendata.aws/speedtest-global-performance/",
    },
    {
      label: "OpenStreetMaps",
      url: "https://openstreetmap.org/",
    },
  ],
  "Average Cellular Download Speed (unit: megabites per second)": [
    {
      label: "Ookla Speedtest Global Performance",
      url: "https://registry.opendata.aws/speedtest-global-performance/",
    },
  ],
  "Key Structures without Internet Access (unit: %)": [
    {
      label: "Ookla Speedtest Global Performance",
      url: "https://registry.opendata.aws/speedtest-global-performance/",
    },
    {
      label: "OpenStreetMaps",
      url: "https://openstreetmap.org/",
    },
  ],
  "Road Flood Risk (unit: %)": [
    { label: "OpenStreetMaps", url: "https://openstreetmap.org/" },
    {
      label: "WRI Aqueduct Floods Hazard Maps Version 2",
      url: "https://developers.google.com/earth-engine/datasets/catalog/WRI_Aqueduct_Flood_Hazard_Maps_V2",
    },
    {
      label: "PIMxPAM Climate Risk Threshold Database",
      url: "https://gpbprtd.eu.pythonanywhere.com/",
    },
  ],
  "Road Heatwave Risk (unit: %)": [
    { label: "OpenStreetMaps", url: "https://openstreetmap.org/" },
    {
      label: "ERA5 Hourly Reanalysis",
      url: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    },
    {
      label: "PIMxPAM Climate Risk Threshold Database",
      url: "https://gpbprtd.eu.pythonanywhere.com/",
    },
  ],
  "Railway Flood Risk (unit: %)": [
    { label: "OpenStreetMaps", url: "https://openstreetmap.org/" },
    {
      label: "WRI Aqueduct Floods Hazard Maps Version 2",
      url: "https://developers.google.com/earth-engine/datasets/catalog/WRI_Aqueduct_Flood_Hazard_Maps_V2",
    },
    {
      label: "PIMxPAM Climate Risk Threshold Database",
      url: "https://gpbprtd.eu.pythonanywhere.com/",
    },
  ],
  "Railway Heatwave Risk (unit: %)": [
    { label: "OpenStreetMaps", url: "https://openstreetmap.org/" },
    {
      label: "ERA5 Hourly Reanalysis",
      url: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    },
    {
      label: "PIMxPAM Climate Risk Threshold Database",
      url: "https://gpbprtd.eu.pythonanywhere.com/",
    },
  ],
  "CO2-Equivalent Emissions (tonnes)": [
    { label: "Climate Trace", url: "https://climatetrace.org/data" },
  ],
  "CO2-Equivalent Emissions per Area (unit: tonnes/km2)": [
    { label: "Climate Trace", url: "https://climatetrace.org/data" },
  ],
  "Nighttime Luminosity (unit: nWatts/(cm2 x sr)": [
    {
      label: "VIIRS Nighttime Day/Night Band Composites Version 1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_MONTHLY_V1_VCMCFG",
    },
  ],
  "Luminosity per Capita (unit: nWatts/(cm2 x sr x person))": [
    {
      label: "VIIRS Nighttime Day/Night Band Composites Version 1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_MONTHLY_V1_VCMCFG",
    },
    {
      label: "WorldPop New Global 2 Population Data",
      url: "https://hub.worldpop.org/project/categories?id=3",
    },
  ],
  "Luminosity per Area (unit: nWatts/(cm2 x sr x km2))": [
    {
      label: "VIIRS Nighttime Day/Night Band Composites Version 1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_MONTHLY_V1_VCMCFG",
    },
    { label: "GADM 4.1 Level 2 Boundaries", url: "https://gadm.org/" },
  ],
  "Change in Build Area (%)": [
    {
      label: "Dynamic World V1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1",
    },
  ],
  "Change in Forest Area (%)": [
    {
      label: "Dynamic World V1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1",
    },
  ],
  "Total Land Area for Agricultural Use (km2)": [
    {
      label: "Dynamic World V1",
      url: "https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_DYNAMICWORLD_V1",
    },
  ],
  "Number of Tourism POIs": [
    {
      label: "OpenStreetMaps",
      url: "https://www.openstreetmap.org/#map=16/44.67174/20.15834",
    },
  ],
};

const SCORE_DEFINITIONS = [
  {
    id: "infrastructure_score",
    label: "Infrastructure Score",
    pillar: "infrastructure",
    componentLabels: [
      "Broadband Internet Score",
      "Mobile Internet Score",
      "Key Structure Internet Access Score",
      "Accessibility to Hospitals Score",
      "Accessibility to Schools Score",
      "Railway Heatwave Score",
      "Road Heatwave Score",
      "Road Flood Score",
      "Railway Flood Score",
    ],
  },
  {
    id: "livability_score",
    label: "Livability Score",
    pillar: "livability",
    componentLabels: [
      "Emissions Score",
      "Air Quality Score",
      "Deforestation Score",
      "Emissions per Area Score",
    ],
  },
  {
    id: "prosperity_score",
    label: "Prosperity Score",
    pillar: "prosperity",
    componentLabels: [
      "Luminosity per Capita Score",
      "Luminosity per Area Score",
      "Built Area Development Score",
      "Tourism Score",
      "Agricultural Land Score",
    ],
  },
];

const EXCLUDED_METADATA_INDICATORS = new Set([
  "Area",
  "Population",
  "Municipality",
  "District",
  "Province",
  "year",
]);

function slugify(input) {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizePillarName(value) {
  const normalized = value ? String(value).toLowerCase() : null;

  if (normalized === "environment") {
    return "livability";
  }

  if (normalized === "infrastructure" || normalized === "prosperity") {
    return normalized;
  }

  return null;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length === 0) {
    return null;
  }
  const sum = filtered.reduce((accumulator, value) => accumulator + value, 0);
  return Number((sum / filtered.length).toFixed(2));
}

function roundCoordinate(value) {
  return Number(value.toFixed(6));
}

function transformPositionToWgs84(position) {
  const [longitude, latitude] = proj4("EPSG:6933", "EPSG:4326", position);
  return [roundCoordinate(longitude), roundCoordinate(latitude)];
}

function getSquaredDistance(left, right) {
  const dx = left[0] - right[0];
  const dy = left[1] - right[1];
  return dx * dx + dy * dy;
}

function getSquaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t =
      ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;

  return dx * dx + dy * dy;
}

function simplifyRadialDistance(points, squaredTolerance) {
  let previousPoint = points[0];
  const simplified = [previousPoint];

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (getSquaredDistance(point, previousPoint) > squaredTolerance) {
      simplified.push(point);
      previousPoint = point;
    }
  }

  if (previousPoint !== points[points.length - 1]) {
    simplified.push(points[points.length - 1]);
  }

  return simplified;
}

function simplifyDouglasPeuckerStep(points, firstIndex, lastIndex, squaredTolerance, simplified) {
  let maxSquaredDistance = squaredTolerance;
  let index = -1;

  for (let currentIndex = firstIndex + 1; currentIndex < lastIndex; currentIndex += 1) {
    const squaredDistance = getSquaredSegmentDistance(
      points[currentIndex],
      points[firstIndex],
      points[lastIndex],
    );

    if (squaredDistance > maxSquaredDistance) {
      index = currentIndex;
      maxSquaredDistance = squaredDistance;
    }
  }

  if (index !== -1) {
    if (index - firstIndex > 1) {
      simplifyDouglasPeuckerStep(
        points,
        firstIndex,
        index,
        squaredTolerance,
        simplified,
      );
    }

    simplified.push(points[index]);

    if (lastIndex - index > 1) {
      simplifyDouglasPeuckerStep(
        points,
        index,
        lastIndex,
        squaredTolerance,
        simplified,
      );
    }
  }
}

function simplifyDouglasPeucker(points, squaredTolerance) {
  const lastIndex = points.length - 1;
  const simplified = [points[0]];

  simplifyDouglasPeuckerStep(
    points,
    0,
    lastIndex,
    squaredTolerance,
    simplified,
  );

  simplified.push(points[lastIndex]);
  return simplified;
}

function simplifyRing(points, tolerance) {
  if (!Array.isArray(points) || points.length <= 4) {
    return points;
  }

  const squaredTolerance = tolerance * tolerance;
  const isClosed =
    points[0][0] === points[points.length - 1][0] &&
    points[0][1] === points[points.length - 1][1];
  const openPoints = isClosed ? points.slice(0, -1) : [...points];

  if (openPoints.length <= 2) {
    return points;
  }

  const simplified = simplifyDouglasPeucker(
    simplifyRadialDistance(openPoints, squaredTolerance),
    squaredTolerance,
  );

  const closedSimplified = isClosed ? [...simplified, simplified[0]] : simplified;

  if (isClosed && closedSimplified.length < 4) {
    return points;
  }

  return closedSimplified;
}

function transformLinearRingToWgs84(ring) {
  return simplifyRing(
    ring.map((position) => transformPositionToWgs84(position)),
    GEOJSON_SIMPLIFY_TOLERANCE,
  );
}

function transformGeometryToWgs84(geometry) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map((ring) =>
        transformLinearRingToWgs84(ring),
      ),
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => transformLinearRingToWgs84(ring)),
      ),
    };
  }

  return geometry;
}

function getCompositeKey(record) {
  return [record.Province, record.District, record.Municipality].join("::");
}

async function readCsv(fileName) {
  const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
}

async function readGeojson(fileName) {
  const raw = await fs.readFile(path.join(DATA_DIR, fileName), "utf8");
  return JSON.parse(raw);
}

async function readIndicatorWorkbook(fileName) {
  const workbook = XLSX.readFile(path.join(DATA_DIR, fileName));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

function createMetricId(label) {
  return slugify(label).replace(/-unit(?:-[a-z0-9]+)*$/, "");
}

function createScoreMetricId(label) {
  return createMetricId(label).replace(/-/g, "_");
}

function buildIndicatorMetadataRows(rows) {
  return rows
    .filter((row) => row.Indicator && !EXCLUDED_METADATA_INDICATORS.has(row.Indicator))
    .map((row, index) => ({
      id: createMetricId(row.Indicator),
      label: row.Indicator,
      description: row.Description || null,
      higherIsBetter:
        row["Direction (higher is better)"] === null
          ? null
          : String(row["Direction (higher is better)"]).toLowerCase() === "yes",
      pillar: normalizePillarName(row["PIL Score"]),
      sortOrder: index,
      sources: SOURCE_MAPPINGS[row.Indicator] ?? [],
    }));
}

function buildContextFields(adminRow) {
  return {
    population: toNumber(adminRow.Population),
    totalLandAreaKm2: toNumber(adminRow["Total Land Area (km2)"]),
    totalRoadLengthKm: toNumber(adminRow["Total Road Length (km)"]),
    totalRailwayLengthKm: toNumber(adminRow["Total Railway Length (km)"]),
    roadFloodRiskKm: toNumber(adminRow["Road Flood Risk (km)"]),
    roadHeatwaveRiskKm: toNumber(adminRow["Road Heatwave Risk (km)"]),
    railwayFloodRiskKm: toNumber(adminRow["Railway Flood Risk (km)"]),
    railwayHeatwaveRiskKm: toNumber(adminRow["Railway Heatwave Risk (km)"]),
  };
}

function projectMunicipality(adminRow, scoreRow, indicatorDefinitions, scoreDefinitions) {
  const indicators = {};
  const scoreComponents = {};
  const scores = {};

  for (const [rawColumn, canonicalLabel] of Object.entries(ADMIN_CANONICAL_MAPPINGS)) {
    const definition = indicatorDefinitions.find((item) => item.label === canonicalLabel);
    if (!definition) {
      continue;
    }

    indicators[definition.id] = toNumber(adminRow[rawColumn]);
  }

  for (const [rawColumn, canonicalLabel] of Object.entries(SCORE_CANONICAL_MAPPINGS)) {
    const value = toNumber(scoreRow[rawColumn]);
    const metricId = createScoreMetricId(canonicalLabel);

    if (canonicalLabel.endsWith("Score") && !scoreDefinitions.some((item) => item.label === canonicalLabel)) {
      scoreComponents[metricId] = value;
      continue;
    }

    if (scoreDefinitions.some((item) => item.label === canonicalLabel)) {
      scores[metricId] = value;
    }
  }

  return {
    id: slugify(`${adminRow.Province}-${adminRow.District}-${adminRow.Municipality}`),
    municipality: adminRow.Municipality,
    district: adminRow.District,
    province: adminRow.Province,
    compositeKey: getCompositeKey(adminRow),
    slug: {
      municipality: slugify(adminRow.Municipality),
      district: slugify(adminRow.District),
      province: slugify(adminRow.Province),
    },
    year: Number(adminRow.Year),
    mapAvailable: false,
    indicators,
    scoreComponents,
    scores,
    context: buildContextFields(adminRow),
  };
}

function buildNationalAverages(municipalities, indicatorDefinitions, scoreDefinitions) {
  const indicatorAverages = {};
  const scoreAverages = {};

  for (const definition of indicatorDefinitions) {
    indicatorAverages[definition.id] = average(
      municipalities.map((municipality) => municipality.indicators[definition.id]),
    );
  }

  for (const definition of scoreDefinitions) {
    scoreAverages[definition.id] = average(
      municipalities.map((municipality) => municipality.scores[definition.id]),
    );
  }

  return {
    indicators: indicatorAverages,
    scores: scoreAverages,
  };
}

function buildProvinceSummary(municipalities, scoreDefinitions) {
  const grouped = new Map();

  for (const municipality of municipalities) {
    const existing = grouped.get(municipality.province) ?? [];
    existing.push(municipality);
    grouped.set(municipality.province, existing);
  }

  return [...grouped.entries()]
    .map(([province, rows]) => {
      const avgScores = {};
      for (const definition of scoreDefinitions) {
        avgScores[definition.id] = average(rows.map((row) => row.scores[definition.id]));
      }

      return {
        province,
        municipalityCount: rows.length,
        averageScores: avgScores,
      };
    })
    .sort((a, b) => a.province.localeCompare(b.province));
}

export async function buildNepalAnalyticsData() {
  const [adminRows, scoreRows, geojson, indicatorWorkbookRows] = await Promise.all([
    readCsv(ADMIN_FILE),
    readCsv(SCORE_FILE),
    readGeojson(GEOJSON_FILE),
    readIndicatorWorkbook(INDICATORS_FILE),
  ]);

  const indicatorDefinitions = buildIndicatorMetadataRows(indicatorWorkbookRows);
  const scoreDefinitions = SCORE_DEFINITIONS.map((item, index) => ({
    ...item,
    sortOrder: index,
    componentIds: item.componentLabels.map((label) => createScoreMetricId(label)),
  }));

  const scoreLookup = new Map(scoreRows.map((row) => [getCompositeKey(row), row]));

  const municipalities = adminRows.map((adminRow) =>
    projectMunicipality(
      adminRow,
      scoreLookup.get(getCompositeKey(adminRow)),
      indicatorDefinitions,
      scoreDefinitions,
    ),
  );

  const analyticsKeys = new Set(municipalities.map((municipality) => municipality.compositeKey));
  const geoFeatures = geojson.features.map((feature) => ({
    ...feature,
    compositeKey: getCompositeKey(feature.properties),
  }));
  const matchedFeatures = geoFeatures.filter((feature) => analyticsKeys.has(feature.compositeKey));
  const boundaryOnlyFeatures = geoFeatures.filter((feature) => !analyticsKeys.has(feature.compositeKey));
  const boundaryFeatureKeys = new Set(matchedFeatures.map((feature) => feature.compositeKey));

  for (const municipality of municipalities) {
    municipality.mapAvailable = boundaryFeatureKeys.has(municipality.compositeKey);
  }

  const nationalAverages = buildNationalAverages(
    municipalities,
    indicatorDefinitions,
    scoreDefinitions,
  );

  const provinceSummary = buildProvinceSummary(municipalities, scoreDefinitions);

  const metrics = [
    ...scoreDefinitions.map((definition) => ({
      id: definition.id,
      label: definition.label,
      kind: "score",
      pillar: definition.pillar,
    })),
    ...indicatorDefinitions.map((definition) => ({
      id: definition.id,
      label: definition.label,
      kind: "indicator",
      pillar: definition.pillar,
      higherIsBetter: definition.higherIsBetter,
    })),
  ];

  return {
    generatedAt: new Date().toISOString(),
    release: {
      key: "npl-2025-v1",
      year: Number(adminRows[0]?.Year ?? 2025),
      adminFileName: ADMIN_FILE,
      scoreFileName: SCORE_FILE,
      geojsonFileName: GEOJSON_FILE,
      indicatorWorkbookFileName: INDICATORS_FILE,
    },
    coverage: {
      analyticsMunicipalityCount: municipalities.length,
      mapMunicipalityCount: matchedFeatures.length,
      analyticsOnlyCount: municipalities.length - matchedFeatures.length,
      boundaryOnlyCount: boundaryOnlyFeatures.length,
    },
    metricIds: {
      defaultMapMetricId: "prosperity_score",
      defaultScatterXMetricId: "infrastructure_score",
      defaultScatterYMetricId: "prosperity_score",
    },
    provinces: [...new Set(municipalities.map((municipality) => municipality.province))].sort(),
    years: [...new Set(municipalities.map((municipality) => municipality.year))].sort((a, b) => a - b),
    indicatorDefinitions,
    scoreDefinitions,
    metrics,
    nationalAverages,
    provinceSummary,
    municipalities,
    mapFeatureKeys: matchedFeatures.map((feature) => feature.compositeKey),
  };
}

export async function buildMatchedGeojson() {
  const dataset = await buildNepalAnalyticsData();
  const geojson = await readGeojson(GEOJSON_FILE);
  const allowedKeys = new Set(dataset.mapFeatureKeys);

  return {
    type: "FeatureCollection",
    features: geojson.features
      .filter((feature) => allowedKeys.has(getCompositeKey(feature.properties)))
      .map((feature) => ({
        type: "Feature",
        properties: {
          Municipality: feature.properties.Municipality,
          District: feature.properties.District,
          Province: feature.properties.Province,
          compositeKey: getCompositeKey(feature.properties),
        },
        geometry: transformGeometryToWgs84(feature.geometry),
      })),
  };
}

export function createMetricIdFromLabel(label) {
  return createMetricId(label);
}
