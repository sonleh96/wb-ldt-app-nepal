export const countries = [
  {
    code: "NPL",
    slug: "nepal",
    name: "Nepal",
    analyticsStatus: "live",
    fallbackDataPath: "src/generated/analytics-data.json",
    mapDataPath: "public/data/nepal-municipalities.geojson",
    adminLabels: {
      lower: { singular: "Municipality", plural: "Municipalities" },
      middle: { singular: "District", plural: "Districts" },
      higher: { singular: "Province", plural: "Provinces" },
    },
    profile: {
      populationMillions: null,
      areaKm2: null,
      context: {
        summary:
          "Nepal provides the baseline country workspace for the LDT, with local analytics organized around provinces, districts, and municipalities across a multi-year score release.",
        highlights: [
          "The workspace is useful for comparing municipality-level variation across terrain, population distribution, and service access patterns.",
          "Planning-document coverage is organized at province level for AI-assisted local plan context.",
          "The latest release now supports 2021-2025 time-series exploration for the core PIL scores.",
        ],
        sourceLinks: [
          {
            label: "National Planning Commission",
            href: "https://npc.gov.np/",
          },
        ],
      },
      strategy: {
        title: "Sixteenth Plan, 2024-2028",
        url: "http://elibrary.moest.gov.np/bitstream/123456789/308/1/16.pdf",
      },
    },
    planningDocuments: {
      aiEnabled: true,
      planSourceAdminLevel: "higher",
      message: "Planning documents are available for AI-assisted analysis.",
    },
  },
  {
    code: "ZMB",
    slug: "zambia",
    name: "Zambia",
    analyticsStatus: "live",
    fallbackDataPath: "src/generated/zambia/analytics-data.json",
    mapDataPath: "public/data/zambia/municipalities.geojson",
    adminLabels: {
      lower: { singular: "District", plural: "Districts" },
      middle: null,
      higher: { singular: "Province", plural: "Provinces" },
    },
    profile: {
      populationMillions: 22.5,
      areaKm2: 763027,
      context: {
        summary:
          "Zambia's LDT workspace links district-level development conditions to a national planning agenda shaped by economic diversification, human capital, infrastructure, agriculture, tourism, and energy-transition minerals.",
        highlights: [
          "The World Bank's Zambia Economic Update points to mining momentum, an agriculture rebound, and tourism improvements as important near-term growth signals.",
          "The 8th National Development Plan frames implementation around national development priorities for 2022-2026, making district-level comparisons useful for translating broad goals into local investment questions.",
          "District and province labels are intentionally preserved in the app so users can move between local plan evidence and higher-level administrative context.",
        ],
        sourceLinks: [
          {
            label: "World Bank Zambia overview",
            href: "https://www.worldbank.org/en/country/zambia/overview",
          },
          {
            label: "8th National Development Plan",
            href: "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
          },
        ],
      },
      strategy: {
        title: "8th National Development Plan",
        url: "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
      },
    },
    planningDocuments: {
      aiEnabled: true,
      planSourceAdminLevel: "lower",
      message:
        "Local/SNG planning documents are available for AI-assisted analysis where source links are loaded.",
    },
  },
  {
    code: "SRB",
    slug: "serbia",
    name: "Serbia",
    analyticsStatus: "live",
    fallbackDataPath: "src/generated/serbia/analytics-data.json",
    mapDataPath: "public/data/serbia/municipalities.geojson",
    adminLabels: {
      lower: { singular: "Municipality", plural: "Municipalities" },
      middle: null,
      higher: { singular: "District", plural: "Districts" },
    },
    profile: {
      populationMillions: 6.7,
      areaKm2: 312717,
      context: {
        summary:
          "Serbia's LDT workspace connects municipality-level PIL evidence to national strategy, EU-aligned reform priorities, service delivery, competitiveness, and climate-resilient development questions.",
        highlights: [
          "The World Bank's Serbia partnership materials emphasize stronger institutions, sustainable growth, and more inclusive service delivery.",
          "The Serbia 2030 Strategy provides the national planning frame for reading local development patterns against Sustainable Development Goal priorities.",
          "Municipality and district labels are kept country-specific so users can interpret local strategy coverage without forcing Serbia into Nepal's administrative terminology.",
        ],
        sourceLinks: [
          {
            label: "World Bank Serbia overview",
            href: "https://www.worldbank.org/en/country/serbia/overview",
          },
          {
            label: "Serbia 2030 Strategy",
            href: "https://rsjp.gov.rs/wp-content/uploads/Srbija-i-Agenda-2030.-februar-2024.-lat.pdf",
          },
        ],
      },
      strategy: {
        title: "Serbia 2030 Strategy",
        url: "https://rsjp.gov.rs/wp-content/uploads/Srbija-i-Agenda-2030.-februar-2024.-lat.pdf",
      },
    },
    planningDocuments: {
      aiEnabled: true,
      planSourceAdminLevel: "lower",
      message:
        "Local/SNG planning documents are available for AI-assisted analysis where source links are loaded.",
    },
  },
] as const;

export type Country = (typeof countries)[number];
export type CountryCode = Country["code"];
export type CountrySlug = Country["slug"];
export type AdminLabels = Country["adminLabels"];

export const defaultCountry = countries[0];

export function getCountryBySlug(slug: string) {
  return countries.find((country) => country.slug === slug) ?? null;
}

export function getCountryByCode(code: string) {
  return countries.find((country) => country.code === code) ?? null;
}
