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
      strategy: {
        title: "8th National Development Plan",
        url: "https://www.cabinet.gov.zm/newsite/wp-content/uploads/2023/12/8NDP-2022-2026.pdf",
      },
    },
    planningDocuments: {
      aiEnabled: true,
      planSourceAdminLevel: "lower",
      message: "Local planning documents will be added in a later release",
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
      strategy: {
        title: "Serbia 2030 Strategy",
        url: "https://rsjp.gov.rs/wp-content/uploads/Srbija-i-Agenda-2030.-februar-2024.-lat.pdf",
      },
    },
    planningDocuments: {
      aiEnabled: true,
      planSourceAdminLevel: "lower",
      message: "Local planning documents will be added in a later release",
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
