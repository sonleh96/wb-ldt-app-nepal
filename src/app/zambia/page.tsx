import { notFound } from "next/navigation";

import { CountryLandingPage } from "@/components/country/country-landing-page";
import { getCountryBySlug } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default function ZambiaPage() {
  const country = getCountryBySlug("zambia");

  if (!country) {
    notFound();
  }

  return <CountryLandingPage country={country} />;
}
