import nepalAnalyticsData from "@/generated/analytics-data.json";
import serbiaAnalyticsData from "@/generated/serbia/analytics-data.json";
import zambiaAnalyticsData from "@/generated/zambia/analytics-data.json";
import nepalMapData from "../../../public/data/nepal-municipalities.geojson";
import serbiaMapData from "../../../public/data/serbia/municipalities.geojson";
import zambiaMapData from "../../../public/data/zambia/municipalities.geojson";
import type { CountryCode } from "@/lib/countries";
import type {
  AnalyticsDataset,
  MapFeatureCollection,
} from "@/types/analytics";

const analyticsDatasetsByCountry = {
  NPL: nepalAnalyticsData,
  ZMB: zambiaAnalyticsData,
  SRB: serbiaAnalyticsData,
} satisfies Record<CountryCode, AnalyticsDataset>;

const mapFeatureCollectionsByCountry = {
  NPL: nepalMapData,
  ZMB: zambiaMapData,
  SRB: serbiaMapData,
} satisfies Record<CountryCode, MapFeatureCollection>;

export function getStaticAnalyticsDataset(countryCode: CountryCode): AnalyticsDataset {
  return analyticsDatasetsByCountry[countryCode];
}

export function getStaticMapFeatureCollection(countryCode: CountryCode): MapFeatureCollection {
  return mapFeatureCollectionsByCountry[countryCode];
}
