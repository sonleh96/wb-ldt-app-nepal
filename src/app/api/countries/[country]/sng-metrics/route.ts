import { NextResponse } from "next/server";

import {
  buildPlanSourceMap,
  buildSngRows,
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
  const planSources = await loadLocalPlanSources(country);
  const rows = buildSngRows(country, dataset, buildPlanSourceMap(planSources));

  return NextResponse.json({ rows });
}
