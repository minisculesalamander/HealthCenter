import "server-only";

import { buildDashboard, type DashboardModel } from "../stats/compute";
import { loadHevyData, type LoadedHevy } from "./load";

export type DashboardPayload = DashboardModel & {
  source: LoadedHevy["source"];
  fixtureName: LoadedHevy["fixtureName"];
};

export async function loadDashboard(now = new Date()): Promise<DashboardPayload> {
  const loaded = await loadHevyData({
    apiKey: process.env.HEVY_API_KEY,
    fixture: process.env.HEVY_FIXTURE,
  });
  const dashboard = buildDashboard(loaded.snapshot, {
    timeZone: process.env.HEVY_TIMEZONE?.trim() || "UTC",
    now,
  });
  return {
    ...dashboard,
    source: loaded.source,
    fixtureName: loaded.fixtureName,
    warnings: [...loaded.warnings, ...dashboard.warnings],
  };
}
