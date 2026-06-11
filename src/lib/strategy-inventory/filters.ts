import { getReadinessCategory } from "./summarize.ts";
import type {
  StrategyInventoryFilters,
  StrategyInventoryRecord,
} from "./types.ts";

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function matchesSearch(record: StrategyInventoryRecord, query: string) {
  if (!query) {
    return true;
  }

  return [
    record.lsg_name,
    record.lsg_name_local,
    record.region_name,
    record.document_title,
    record.notes,
  ].some((value) => normalize(value).includes(query));
}

export function filterStrategyInventoryRecords(
  records: StrategyInventoryRecord[],
  filters: StrategyInventoryFilters,
) {
  const query = normalize(filters.query);

  return records.filter((record) => {
    const publicationYear = Number.isFinite(record.publication_year)
      ? String(record.publication_year)
      : "Unknown";

    return (
      matchesSearch(record, query) &&
      (!filters.publicationYear ||
        filters.publicationYear === "all" ||
        filters.publicationYear === publicationYear) &&
      (!filters.readinessCategory ||
        filters.readinessCategory === "all" ||
        filters.readinessCategory === getReadinessCategory(record)) &&
      (!filters.documentType ||
        filters.documentType === "all" ||
        filters.documentType === record.document_type) &&
      (!filters.translationStatus ||
        filters.translationStatus === "all" ||
        filters.translationStatus === record.translation_status)
    );
  });
}
