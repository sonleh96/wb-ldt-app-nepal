import { NextResponse } from "next/server";

import { buildCountryHomeModel } from "@/lib/country-home";
import {
  buildPlanAvailabilityGroups,
  buildPlanSourceMap,
  loadCountryDataset,
  loadLocalPlanSources,
} from "@/lib/country-landing-data";
import { getCountryBySlug } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string }> },
) {
  const { country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  const dataset = await loadCountryDataset(country);
  const model = buildCountryHomeModel(country, dataset);
  const planSources = await loadLocalPlanSources(country);
  const groups = buildPlanAvailabilityGroups(
    country,
    model.groups,
    buildPlanSourceMap(planSources),
  );

  return NextResponse.json({ groups });
}
