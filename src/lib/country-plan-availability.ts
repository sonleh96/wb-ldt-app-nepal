import type { Country } from "@/lib/countries";

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function getPlanAvailabilityDisclosure(country: Country) {
  const trackedUnitLabel =
    country.planningDocuments.planSourceAdminLevel === "lower"
      ? lowerFirst(country.adminLabels.lower.plural)
      : lowerFirst(country.adminLabels.higher.plural);

  return {
    defaultOpen: false,
    trackedUnitLabel,
    description: `${country.planningDocuments.message} This section tracks which ${trackedUnitLabel} currently have local/SNG plan links available for AI-assisted analysis.`,
  };
}
