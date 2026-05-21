export const canonicalLabelMappings = [
  {
    raw: "Accessibility to Hospitals (%)",
    canonical: "Accessibility to Health Services (unit: %)",
  },
  {
    raw: "Accessibility to Schools (%)",
    canonical: "Accessibility to School Services (unit: %)",
  },
  {
    raw: "Average Broadband Internet Download Speed (Mbps)",
    canonical:
      "Average Broadband Download Speed (unit: megabites per second)",
  },
  {
    raw: "Average Mobile Internet Download Speed (Mbps)",
    canonical:
      "Average Cellular Download Speed (unit: megabites per second)",
  },
  {
    raw: "Key Structures without Access to Broadband Internet (%)",
    canonical: "Key Structures without Internet Access (unit: %)",
  },
  {
    raw: "Average PM25 Concentration (ug/m3)",
    canonical: "PM 2.5 concentration (unit: ug/m3)",
  },
  {
    raw: "C02 Emissions per Area (tonnes/km2)",
    canonical: "CO2-Equivalent Emissions per Area (unit: tonnes/km2)",
  },
] as const;

export const scoreLabelMappings = [
  {
    raw: "Emissions Normalized Score",
    canonical: "Emissions per Area Score",
  },
] as const;

export const scoreComponentIndicatorMappings = {
  broadband_internet_score: "average-broadband-download-speed",
  mobile_internet_score: "average-cellular-download-speed",
  key_structure_internet_access_score: "key-structures-without-internet-access",
  accessibility_to_hospitals_score: "accessibility-to-health-services",
  accessibility_to_schools_score: "accessibility-to-school-services",
  railway_heatwave_score: "railway-heatwave-risk",
  road_heatwave_score: "road-heatwave-risk",
  road_flood_score: "road-flood-risk",
  railway_flood_score: "railway-flood-risk",
  emissions_score: "co2-equivalent-emissions-tonnes",
  air_quality_score: "pm-2-5-concentration",
  deforestation_score: "change-in-forest-area",
  emissions_per_area_score: "co2-equivalent-emissions-per-area",
  luminosity_per_capita_score: "luminosity-per-capita",
  luminosity_per_area_score: "luminosity-per-area",
  built_area_development_score: "change-in-build-area",
  tourism_score: "number-of-tourism-pois",
  agricultural_land_score: "total-land-area-for-agricultural-use-km2",
} as const;
