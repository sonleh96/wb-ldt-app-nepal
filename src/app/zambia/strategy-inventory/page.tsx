import type { Metadata } from "next";

import { StrategyInventoryDashboard } from "@/components/strategy-inventory/strategy-inventory-dashboard";
import { loadStrategyInventoryDataset } from "@/lib/strategy-inventory/server";

export const metadata: Metadata = {
  title: "Zambia Strategy Inventory | Local Development Tracker",
  description:
    "Coverage, publication year, translation status, and AI-readiness of Zambian local strategy and budget documents.",
};

export const dynamic = "force-dynamic";

export default async function ZambiaStrategyInventoryPage() {
  const dataset = await loadStrategyInventoryDataset({
    countryCode: "ZMB",
    countryName: "Zambia",
    expectedLsgCount: 116,
    samplePath: "public/data/zambia/strategy_inventory.sample.json",
  });

  return (
    <StrategyInventoryDashboard
      dataset={dataset}
    />
  );
}
