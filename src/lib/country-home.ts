type AdminLevelLabels = {
  singular: string;
  plural: string;
};

type CountryHomeCountry = {
  name: string;
  slug: string;
  adminLabels: {
    lower: AdminLevelLabels;
    higher: AdminLevelLabels;
  };
  profile: {
    populationMillions: number | null;
    areaKm2: number | null;
    strategy: {
      title: string;
      url: string;
    };
  };
  planningDocuments: {
    message: string;
  };
};

type CountryHomeMunicipality = {
  year: number;
  municipality: string;
  province: string;
  context: {
    population: number | null;
    totalLandAreaKm2: number | null;
  };
};

type CountryHomeDataset = {
  release: {
    key: string;
    year: number;
  };
  years: number[];
  municipalities: CountryHomeMunicipality[];
};

export type CountryHomeGroup = {
  name: string;
  lowerUnits: string[];
};

export type CountryHomeModel = {
  latestYear: number;
  releaseKey: string;
  lowerCount: number;
  higherCount: number;
  populationLabel: string;
  areaLabel: string;
  groups: CountryHomeGroup[];
};

const oneDecimalFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function sumFinite(values: Array<number | null | undefined>): number {
  return values.reduce<number>((sum, value) => {
    return Number.isFinite(value) ? sum + (value as number) : sum;
  }, 0);
}

function latestDatasetRows(dataset: CountryHomeDataset) {
  const latestYear = Math.max(dataset.release.year, ...dataset.years);
  const rowsForLatestYear = dataset.municipalities.filter(
    (municipality) => municipality.year === latestYear,
  );

  return {
    latestYear,
    rows: rowsForLatestYear.length > 0 ? rowsForLatestYear : dataset.municipalities,
  };
}

export function formatPopulationMillions(value: number) {
  return `${oneDecimalFormatter.format(value)} million`;
}

export function formatAreaKm2(value: number) {
  return `${oneDecimalFormatter.format(value)} sq km`;
}

export function buildCountryHomeModel(
  country: CountryHomeCountry,
  dataset: CountryHomeDataset,
): CountryHomeModel {
  const { latestYear, rows } = latestDatasetRows(dataset);
  const totalPopulation = sumFinite(
    rows.map((municipality) => municipality.context.population),
  );
  const totalAreaKm2 = sumFinite(
    rows.map((municipality) => municipality.context.totalLandAreaKm2),
  );
  const populationMillions =
    country.profile.populationMillions ?? totalPopulation / 1_000_000;
  const areaKm2 = country.profile.areaKm2 ?? totalAreaKm2;

  const grouped = new Map<string, string[]>();
  for (const municipality of rows) {
    const existing = grouped.get(municipality.province) ?? [];
    existing.push(municipality.municipality);
    grouped.set(municipality.province, existing);
  }

  const groups = [...grouped.entries()]
    .map(([name, lowerUnits]) => ({
      name,
      lowerUnits: lowerUnits.sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    latestYear,
    releaseKey: dataset.release.key,
    lowerCount: rows.length,
    higherCount: groups.length,
    populationLabel: formatPopulationMillions(populationMillions),
    areaLabel: formatAreaKm2(areaKm2),
    groups,
  };
}
