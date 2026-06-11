declare module "*.geojson" {
  import type { MapFeatureCollection } from "@/types/analytics";

  const value: MapFeatureCollection;
  export default value;
}
