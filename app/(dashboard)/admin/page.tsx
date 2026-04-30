"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CircleDollarSign,
  Clock3,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { dashboardService, type AdminOverview } from "@/services/dashboard.service";

const emptyOverview: AdminOverview = {
  metrics: {
    totalUsers: 0,
    buyers: 0,
    vendors: 0,
    admins: 0,
    activeStores: 0,
    suspendedStores: 0,
    pendingStores: 0,
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    grossRevenue: 0,
    platformCommission: 0,
    pendingRefunds: 0,
  },
  weeklySales: [],
  moderationQueue: [],
  recentOrders: [],
};

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadOverview = async () => {
      setIsLoading(true);

      try {
        const result = await dashboardService.getAdminOverview();
        if (!isActive) return;
        setOverview(result);
      } catch {
        toast.error("Unable to load admin overview.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total users",
        value: overview.metrics.totalUsers.toString(),
        detail: `${overview.metrics.buyers} buyers, ${overview.metrics.vendors} vendors`,
        icon: Users,
      },
      {
        label: "Active vendors",
        value: overview.metrics.activeStores.toString(),
        detail: `${overview.metrics.suspendedStores} suspended`,
        icon: Store,
      },
      {
        label: "Products",
        value: overview.metrics.totalProducts.toString(),
        detail: `${overview.metrics.publishedProducts} published, ${overview.metrics.draftProducts} draft`,
        icon: Package,
      },
      {
        label: "Orders",
        value: overview.metrics.totalOrders.toString(),
        detail: `${overview.metrics.activeOrders} active fulfillment`,
        icon: ShoppingBag,
      },
      {
        label: "Gross revenue",
        value: formatCurrency(overview.metrics.grossRevenue),
        detail: "Paid marketplace orders",
        icon: CircleDollarSign,
      },
      {
        label: "Commission",
        value: formatCurrency(overview.metrics.platformCommission),
        detail: "Estimated at 10%",
        icon: ShieldCheck,
      },
    ],
    [overview]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin overview</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#171714]">Platform control</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Vendors are onboarded immediately. Admin work focuses on moderation, suspensions, refunds, product visibility, and marketplace performance.
            </p>
          </div>
          <div className="rounded-2xl bg-[#F6F6F4] px-4 py-3 text-xs font-black text-[#74746F]">
            {isLoading ? "Syncing metrics..." : "Live moderation snapshot"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[26px] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <Icon className="h-5 w-5 text-[#F25A1D]" />
                <span className="rounded-full bg-[#F6F6F4] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8A8A86]">
                  Admin
                </span>
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#171714]">Revenue and order flow</h2>
              <p className="mt-1 text-xs font-semibold text-[#74746F]">Paid order volume across the last seven days.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Platform
            </span>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.weeklySales}>
                <defs>
                  <linearGradient id="adminRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#F25A1D" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#F25A1D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EFEFEB" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#8A8A86", fontSize: 11, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8A8A86", fontSize: 11, fontWeight: 700 }} tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 16, border: "1px solid #EFEFEB", fontWeight: 800 }} />
                <Area type="monotone" dataKey="revenue" stroke="#F25A1D" strokeWidth={3} fill="url(#adminRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#171714]">Moderation queue</h2>
              <p className="mt-1 text-xs font-semibold text-[#74746F]">Items needing admin attention.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-[#F25A1D]" />
          </div>

          <div className="mt-5 space-y-3">
            {overview.moderationQueue.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-[#F6F6F4] p-4">
                <div>
                  <p className="text-sm font-black text-[#171714]">{item.label}</p>
                  <p className="mt-1 text-xs font-bold text-[#8A8A86]">{item.priority}</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black text-[#F25A1D] shadow-sm">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[#171714]">Recent orders</h2>
            <p className="mt-1 text-xs font-semibold text-[#74746F]">Latest marketplace transactions across buyers and vendors.</p>
          </div>
          <Clock3 className="h-5 w-5 text-[#F25A1D]" />
        </div>

        <div className="mt-5 divide-y divide-black/[0.06]">
          {overview.recentOrders.length === 0 ? (
            <div className="rounded-2xl bg-[#F6F6F4] p-5 text-sm font-black text-[#74746F]">No orders yet.</div>
          ) : (
            overview.recentOrders.map((order) => (
              <div key={order._id} className="grid gap-3 py-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-black text-[#171714]">{order.orderNumber}</p>
                  <p className="mt-1 text-xs font-bold text-[#8A8A86]">{order.buyerName} - {order.itemCount} item(s)</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                  {order.status}
                </span>
                <p className="text-xs font-black text-[#74746F]">{order.paymentStatus}</p>
                <p className="text-sm font-black text-[#171714]">{formatCurrency(order.total)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
