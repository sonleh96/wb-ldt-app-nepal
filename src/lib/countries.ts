export const countries = [
  {
    code: "NPL",
    slug: "nepal",
    name: "Nepal",
    fallbackDataPath: "src/generated/analytics-data.json",
    mapDataPath: "public/data/nepal-municipalities.geojson",
  },
  {
    code: "ZMB",
    slug: "zambia",
    name: "Zambia",
    fallbackDataPath: "src/generated/zambia/analytics-data.json",
    mapDataPath: "public/data/zambia/municipalities.geojson",
  },
  {
    code: "SRB",
    slug: "serbia",
    name: "Serbia",
    fallbackDataPath: "src/generated/serbia/analytics-data.json",
    mapDataPath: "public/data/serbia/municipalities.geojson",
  },
] as const;

export type Country = (typeof countries)[number];
export type CountryCode = Country["code"];
export type CountrySlug = Country["slug"];

export const defaultCountry = countries[0];

export function getCountryBySlug(slug: string) {
  return countries.find((country) => country.slug === slug) ?? null;
}

export function getCountryByCode(code: string) {
  return countries.find((country) => country.code === code) ?? null;
}
