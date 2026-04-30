import type { DashboardStat } from "@/types/dashboard";

type StatGridProps = {
  stats: DashboardStat[];
};

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">{stat.label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#111]">{stat.value}</p>
          <p className="mt-2 text-[11px] font-semibold text-[#111]/40">{stat.detail}</p>
        </div>
      ))}
    </div>
  );
}
