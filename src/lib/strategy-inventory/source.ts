import type {
  StrategyInventoryDataset,
  StrategyInventoryRecord,
} from "./types.ts";

type BuildStrategyInventoryDatasetInput = {
  countryCode: string;
  countryName: string;
  expectedLsgCount: number;
  isSampleData: boolean;
  records: StrategyInventoryRecord[];
};

function normalizeKeyPart(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function latestUpdatedDate(records: StrategyInventoryRecord[]) {
  const dates = records
    .map((record) => record.last_updated)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));

  return dates.at(-1) ?? new Date().toISOString().slice(0, 10);
}

export function getStrategyInventoryDocumentKey(
  record: Pick<
    StrategyInventoryRecord,
    "lsg_id" | "document_type" | "document_title" | "source_url"
  >,
) {
  return [
    normalizeKeyPart(record.lsg_id),
    normalizeKeyPart(record.document_type),
    normalizeKeyPart(record.document_title),
    normalizeKeyPart(record.source_url),
  ].join("|");
}

export function buildStrategyInventoryDataset({
  countryCode,
  countryName,
  expectedLsgCount,
  isSampleData,
  records,
}: BuildStrategyInventoryDatasetInput): StrategyInventoryDataset {
  const sortedRecords = [...records].sort((left, right) => {
    const nameComparison = left.lsg_name.localeCompare(right.lsg_name);

    if (nameComparison !== 0) {
      return nameComparison;
    }

    return left.document_type.localeCompare(right.document_type);
  });

  return {
    country_code: countryCode,
    country_name: countryName,
    is_sample_data: isSampleData,
    expected_lsg_count: expectedLsgCount,
    last_updated: latestUpdatedDate(sortedRecords),
    records: sortedRecords,
  };
}
