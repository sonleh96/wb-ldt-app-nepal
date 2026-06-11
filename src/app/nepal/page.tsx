import { notFound } from "next/navigation";

import { CountryLandingPage } from "@/components/country/country-landing-page";
import { getCountryBySlug } from "@/lib/countries";

export const dynamic = "force-dynamic";

export default function NepalPage() {
  const country = getCountryBySlug("nepal");

  if (!country) {
    notFound();
  }

  return <CountryLandingPage country={country} />;
}
