import type { DashboardCard } from "../_lib/getAdminDashboardData";

export function StatsCards({ cards }: { cards: DashboardCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-background/15 bg-background/10 p-5"
        >
          <p className="text-sm text-background/65">{card.title}</p>
          <p className="mt-3 text-3xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}