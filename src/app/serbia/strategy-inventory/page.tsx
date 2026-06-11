import type { Metadata } from "next";

import { StrategyInventoryDashboard } from "@/components/strategy-inventory/strategy-inventory-dashboard";
import { loadStrategyInventoryDataset } from "@/lib/strategy-inventory/server";

export const metadata: Metadata = {
  title: "Serbia Strategy Inventory | Local Development Tracker",
  description:
    "Coverage, publication year, translation status, and AI-readiness of Serbian local strategy and budget documents.",
};

export const dynamic = "force-dynamic";

export default async function SerbiaStrategyInventoryPage() {
  const dataset = await loadStrategyInventoryDataset({
    countryCode: "SRB",
    countryName: "Serbia",
    expectedLsgCount: 161,
    samplePath: "public/data/serbia/strategy_inventory.sample.json",
  });

  return (
    <StrategyInventoryDashboard
      dataset={dataset}
    />
  );
}
