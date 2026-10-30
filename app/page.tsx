import { Dashboard, DashboardError } from "../components/dashboard";
import { loadDashboard } from "../lib/hevy/server";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const params = await searchParams;
  try {
    const data = await loadDashboard();
    return <Dashboard data={data} selectedExercise={params.exercise} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load Hevy data.";
    return <DashboardError message={message} />;
  }
}
