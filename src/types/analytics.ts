import type { AiTabData } from "@/lib/ai/types";
import type { CountryCode, CountrySlug } from "@/lib/countries";

export type Pillar = "infrastructure" | "livability" | "prosperity";

export type SourceBadge = {
  label: string;
  url: string;
};

export type IndicatorDefinition = {
  id: string;
  label: string;
  description: string | null;
  higherIsBetter: boolean | null;
  pillar: Pillar | null;
  sortOrder: number;
  sources: SourceBadge[];
};

export type ScoreDefinition = {
  id: string;
  label: string;
  pillar: Pillar;
  componentLabels: string[];
  componentIds: string[];
  sortOrder: number;
};

export type ScoreComponentDefinition = {
  id: string;
  label: string;
  description: string | null;
};

export type ScoreWaterfallRow = {
  componentId: string;
  label: string;
  description: string | null;
  municipalityValue: number | null;
  nationalValue: number | null;
  contribution: number | null;
};

export type ScoreWaterfallGroup = {
  scoreId: string;
  scoreLabel: string;
  municipalityScore: number | null;
  nationalScore: number | null;
  totalDifference: number | null;
  rows: ScoreWaterfallRow[];
};

export type MetricDefinition = {
  id: string;
  label: string;
  kind: "score" | "indicator";
  pillar?: Pillar | null;
  higherIsBetter?: boolean | null;
};

export type MunicipalityRecord = {
  id: string;
  municipality: string;
  district: string;
  province: string;
  compositeKey: string;
  slug: {
    municipality: string;
    district: string;
    province: string;
  };
  year: number;
  mapAvailable: boolean;
  indicators: Record<string, number | null>;
  scoreComponents: Record<string, number | null>;
  scores: Record<string, number | null>;
  context: {
    population: number | null;
    totalLandAreaKm2: number | null;
    totalRoadLengthKm: number | null;
    totalRailwayLengthKm: number | null;
    roadFloodRiskKm: number | null;
    roadHeatwaveRiskKm: number | null;
    railwayFloodRiskKm: number | null;
    railwayHeatwaveRiskKm: number | null;
  };
};

export type AnalyticsDataset = {
  generatedAt: string;
  release: {
    key: string;
    year: number;
    adminFileName: string;
    scoreFileName: string;
    geojsonFileName: string;
    indicatorWorkbookFileName: string;
  };
  coverage: {
    analyticsMunicipalityCount: number;
    mapMunicipalityCount: number;
    analyticsOnlyCount: number;
    boundaryOnlyCount: number;
  };
  metricIds: {
    defaultMapMetricId: string;
    defaultScatterXMetricId: string;
    defaultScatterYMetricId: string;
  };
  provinces: string[];
  years: number[];
  indicatorDefinitions: IndicatorDefinition[];
  scoreDefinitions: ScoreDefinition[];
  metrics: MetricDefinition[];
  nationalAverages: {
    indicators: Record<string, number | null>;
    scores: Record<string, number | null>;
  };
  provinceSummary: Array<{
    province: string;
    municipalityCount: number;
    averageScores: Record<string, number | null>;
  }>;
  municipalities: MunicipalityRecord[];
  mapFeatureKeys: string[];
};

export type MapFeature = {
  type: "Feature";
  properties: {
    Municipality: string;
    District: string;
    Province: string;
    compositeKey: string;
  };
  geometry: GeoJSON.Geometry;
};

export type AnalyticsFeature = MapFeature & {
  metricValue: number | null;
};

export type MapFeatureCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

export type AnalyticsPageData = {
  country: {
    code: CountryCode;
    slug: CountrySlug;
    name: string;
  };
  release: AnalyticsDataset["release"] & {
    countryCode: CountryCode;
  };
  nationalAverages: AnalyticsDataset["nationalAverages"];
  filters: {
    years: number[];
    provinces: string[];
    metrics: MetricDefinition[];
    scoreMetrics: MetricDefinition[];
    municipalities: Array<{
      id: string;
      label: string;
    }>;
  };
  coverage: AnalyticsDataset["coverage"];
  selected: {
    year: number;
    province: string;
    municipalityId: string;
    municipalityName: string;
    metricId: string;
    xMetricId: string;
    yMetricId: string;
    aiScoreId: string;
  };
  municipality: MunicipalityRecord;
  map: {
    metric: MetricDefinition;
    features: AnalyticsFeature[];
    summary: {
      minimum: number | null;
      maximum: number | null;
      average: number | null;
    };
    coverageLabel: string;
  };
  scatter2d: {
    xMetric: MetricDefinition;
    yMetric: MetricDefinition;
    points: Array<{
      id: string;
      label: string;
      district: string;
      province: string;
      x: number | null;
      y: number | null;
      selected: boolean;
    }>;
  };
  scatter3d: {
    points: Array<{
      id: string;
      label: string;
      district: string;
      province: string;
      x: number | null;
      y: number | null;
      z: number | null;
      selected: boolean;
    }>;
  };
  metadata: {
    selectedMetric: IndicatorDefinition | null;
    scoreDefinition: ScoreDefinition;
    scoreComponents: ScoreComponentDefinition[];
    scoreDriverRows: Array<{
      componentId: string;
      label: string;
      municipalityValue: number | null;
      nationalValue: number | null;
      delta: number | null;
    }>;
  };
  waterfalls: ScoreWaterfallGroup[];
  provinceSummary: AnalyticsDataset["provinceSummary"];
  ai: AiTabData;
};
