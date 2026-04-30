"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { dashboardService, type SellerOverview } from "@/services/dashboard.service";

const emptyOverview: SellerOverview = {
  metrics: {
    grossRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    customerRating: null,
  },
  weeklySales: [],
  fulfillmentQueue: [],
  recentOrders: [],
  lowStockProducts: [],
};

export default function SellerDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [overview, setOverview] = useState<SellerOverview>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadOverview = async () => {
      try {
        const result = await dashboardService.getSellerOverview();
        if (isActive) setOverview(result);
      } catch {
        toast.error("Unable to load seller overview.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, []);

  const salesChartData = useMemo(
    () =>
      overview.weeklySales.map((day) => ({
        name: day.label,
        Sales: day.revenue,
        Orders: day.orders,
      })),
    [overview.weeklySales]
  );

  const queueTotal = overview.fulfillmentQueue.reduce((total, item) => total + item.count, 0);

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
        Loading seller overview...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#111]">Dashboard Overview</h2>
          <p className="mt-1 text-[13px] font-semibold text-[#111]/40">
            Review live transactions, catalog health, and customer dispatch levels today.
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-[#111] px-5 text-xs font-black text-white"
        >
          New product
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Gross Revenues",
            value: formatCurrency(overview.metrics.grossRevenue),
            trend: "Non-failed seller fulfillments",
            icon: CircleDollarSign,
            color: "text-[#C4553A]",
            href: "/seller/earnings",
          },
          {
            label: "Active Orders",
            value: overview.metrics.activeOrders.toString(),
            trend: overview.metrics.activeOrders ? "Requires attention" : "No open queue",
            icon: ShoppingBag,
            color: "text-blue-600",
            href: "/seller/orders",
          },
          {
            label: "Total Catalog",
            value: overview.metrics.totalProducts.toString(),
            trend: `${overview.metrics.publishedProducts} published / ${overview.metrics.draftProducts} draft`,
            icon: Package,
            color: "text-indigo-600",
            href: "/seller/products",
          },
          {
            label: "Customer Rating",
            value: overview.metrics.customerRating ? `${overview.metrics.customerRating} ★` : "N/A",
            trend: "Reviews module pending",
            icon: Sparkles,
            color: "text-emerald-600",
            href: "/seller/orders",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Link key={metric.label} href={metric.href} className="rounded-2xl border border-black/[0.04] bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="mb-4 flex items-center justify-between">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <ArrowUpRight className="h-4 w-4 text-[#111]/25" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]/30">
                {metric.label}
              </p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-[#111]">{metric.value}</h3>
              <p className="mt-2 text-[11px] font-semibold text-[#111]/40">{metric.trend}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
                Weekly Sales Flow
              </h3>
              <p className="mt-0.5 text-[11px] font-semibold text-[#111]/45">
                Revenue generated from recent marketplace orders.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/[0.06] px-2.5 py-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Synced
            </div>
          </div>

          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4553A" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#C4553A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                  <ChartTooltip
                    formatter={(value, name) => [name === "Sales" ? formatCurrency(Number(value)) : value, name]}
                    cursor={{ stroke: "#C4553A", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Sales"
                    stroke="#C4553A"
                    strokeWidth={3}
                    fill="url(#salesGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-2xl bg-black/[0.03]" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">
                Fulfillment Queue
              </h3>
              <span className="rounded-full bg-[#FAF1EE] px-2.5 py-1 text-[11px] font-black text-[#C4553A]">
                {queueTotal}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-[#111]/45">
              Orders that still need seller action.
            </p>
            <div className="mt-5 space-y-3">
              {overview.fulfillmentQueue.map((item) => (
                <Link key={item.status} href={`/seller/orders?status=${encodeURIComponent(item.status)}`} className="flex items-center justify-between rounded-2xl bg-[#FAF9F5] px-4 py-3">
                  <span className="text-[12px] font-bold text-[#111]/60">{item.status}</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#C4553A] shadow-sm">
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#C4553A]/10 bg-[#C4553A]/[0.04] p-6">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Paystack Escrow</h3>
            <p className="mt-2 text-[12px] leading-relaxed text-[#111]/55">
              Paid orders become part of your seller revenue while refunds and failed payments are excluded from gross totals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Recent Orders</h3>
            <Link href="/seller/orders" className="text-xs font-black text-[#C4553A]">View all</Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.recentOrders.length === 0 ? (
              <div className="rounded-2xl bg-[#FAF9F5] p-5 text-sm font-semibold text-[#111]/45">No seller orders yet.</div>
            ) : (
              overview.recentOrders.map((order) => (
                <Link key={order._id} href={`/seller/orders/${order._id}`} className="grid gap-3 rounded-2xl bg-[#FAF9F5] p-3 sm:grid-cols-[54px_minmax(0,1fr)_auto]">
                  <div className="relative h-14 overflow-hidden rounded-xl bg-white">
                    {order.firstItem?.image ? (
                      <Image src={order.firstItem.image} alt={order.firstItem.name} fill sizes="54px" className="object-contain p-1.5" />
                    ) : (
                      <div className="grid h-full place-items-center text-[#C4553A]">
                        <PackageCheck className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#111]">{order.orderNumber}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-[#111]/45">
                      {order.buyerName} • {order.buyerCity} • {order.itemCount} item(s)
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#C4553A]">
                      {order.status}
                    </span>
                  </div>
                  <p className="self-center text-sm font-black text-[#111]">{formatCurrency(order.subtotal)}</p>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-black/[0.04] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-[#111]">Low Stock Products</h3>
            <Link href="/seller/products" className="text-xs font-black text-[#C4553A]">Manage</Link>
          </div>
          <div className="mt-5 space-y-3">
            {overview.lowStockProducts.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">No low-stock products right now.</div>
            ) : (
              overview.lowStockProducts.map((product) => (
                <Link key={product._id} href={`/seller/products/${product._id}`} className="grid gap-3 rounded-2xl bg-[#FAF9F5] p-3 sm:grid-cols-[54px_minmax(0,1fr)_auto]">
                  <div className="relative h-14 overflow-hidden rounded-xl bg-white">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill sizes="54px" className="object-contain p-1.5" />
                    ) : (
                      <div className="grid h-full place-items-center text-[#C4553A]">
                        <TriangleAlert className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#111]">{product.name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-[#111]/45">{product.sku || product.category}</p>
                  </div>
                  <div className="self-center text-right">
                    <p className="text-sm font-black text-[#C4553A]">{product.stock}</p>
                    <p className="text-[10px] font-bold uppercase text-[#111]/35">left</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
