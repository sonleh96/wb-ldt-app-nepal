import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";

import { StrategyInventoryDashboard } from "@/components/strategy-inventory/strategy-inventory-dashboard";
import type { StrategyInventoryDataset } from "@/lib/strategy-inventory/types";

export const metadata: Metadata = {
  title: "Serbia Strategy Inventory | Local Development Tracker",
  description:
    "Coverage, publication year, translation status, and AI-readiness of Serbian local strategy and budget documents.",
};

async function loadStrategyInventoryDataset() {
  const datasetPath = path.join(
    process.cwd(),
    "public/data/serbia/strategy_inventory.sample.json",
  );
  const rawDataset = await readFile(datasetPath, "utf8");

  return JSON.parse(rawDataset) as StrategyInventoryDataset;
}

export default async function SerbiaStrategyInventoryPage() {
  const dataset = await loadStrategyInventoryDataset();

  return (
    <StrategyInventoryDashboard
      dataset={dataset}
    />
  );
}
