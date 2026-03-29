import { getAdminDashboardData } from "./_lib/getAdminDashboardData";
import { StatsCards } from "./_components/StatsCard";
import { RecentOrdersPanel } from "./_components/RecentOrdersPanel";
import { QuickActionsPanel } from "./_components/QuickActionsPanel";

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardData();

  if (!result.ok) {
    return (
      <section className="space-y-8 text-background">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-background/60">
            Overview
          </p>
          <h2 className="mt-2 text-4xl font-semibold">Admin Dashboard</h2>
          <p className="mt-3 text-red-700">
            Failed to load dashboard data: {result.error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 text-background">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-background/60">
          Overview
        </p>
        <h2 className="mt-2 text-4xl font-semibold">Admin Dashboard</h2>
      </div>

      <StatsCards cards={result.cards} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RecentOrdersPanel recentOrders={result.recentOrders} />

        <QuickActionsPanel monthlyRevenue={result.monthlyRevenue} />
      </div>
    </section>
  );
}