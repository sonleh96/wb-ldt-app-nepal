import type { Country } from "@/lib/countries";

export type CountryLandingAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  align: "left" | "right";
};

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function getCountryLandingActions(country: Country): CountryLandingAction[] {
  const lowerUnitLabel = lowerFirst(country.adminLabels.lower.singular);
  const actions: CountryLandingAction[] = [
    {
      label: `Analyze ${lowerUnitLabel} metrics`,
      href: `/${country.slug}/analytics`,
      variant: "primary",
      align: "left",
    },
  ];

  if (country.slug === "serbia" || country.slug === "zambia") {
    actions.push({
      label: "Strategy inventory",
      href: `/${country.slug}/strategy-inventory`,
      variant: "secondary",
      align: "left",
    });
  }

  actions.push({
    label: "Return to Homepage",
    href: "/",
    variant: "secondary",
    align: "right",
  });

  return actions;
}
