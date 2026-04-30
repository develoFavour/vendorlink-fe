"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, PackageCheck, PackageOpen, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { orderService, type BuyerOrder } from "@/services/order.service";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const getStatusIcon = (status: string) => {
  if (status === "Delivered") return CheckCircle2;
  if (status === "In Transit") return Truck;
  if (status === "Pending") return Clock3;
  return PackageCheck;
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const placedOrderId = searchParams.get("placed");
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlacedBanner, setShowPlacedBanner] = useState(Boolean(placedOrderId));

  useEffect(() => {
    orderService
      .getOrders()
      .then(setOrders)
      .catch(() => toast.error("Unable to load your orders."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!placedOrderId) return;

    const timeoutId = window.setTimeout(() => {
      setShowPlacedBanner(false);
      router.replace("/buyer/orders", { scroll: false });
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [placedOrderId, router]);

  const stats = useMemo(() => {
    const active = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    const totalSpent = orders.reduce((total, order) => total + order.total, 0);

    return [
      { label: "Total orders", value: orders.length.toString(), icon: ShoppingBag },
      { label: "Active orders", value: active.toString(), icon: Truck },
      { label: "Delivered", value: delivered.toString(), icon: CheckCircle2 },
      { label: "Total spent", value: formatCurrency(totalSpent), icon: PackageCheck },
    ];
  }, [orders]);

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showPlacedBanner && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-50 p-5 text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-black">Order placed successfully. Your vendor will confirm dispatch soon.</p>
          </div>
        </div>
      )}

      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Buyer orders</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">My orders</h1>
            <p className="mt-1 text-sm font-semibold text-[#74746F]">
              Track purchases, delivery progress, and payment status.
            </p>
          </div>
          <Link
            href="/buyer/products"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#171714] px-5 text-xs font-black text-white"
          >
            Keep shopping
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[22px] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-5">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
            </div>
          );
        })}
      </section>

      {orders.length === 0 ? (
        <section className="grid min-h-[42vh] place-items-center rounded-[24px] bg-white p-5 text-center shadow-sm sm:rounded-[32px] sm:p-8">
          <div className="max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFEDE5] text-[#F25A1D]">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-[#171714]">No orders yet</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">
              Your completed checkouts will appear here with delivery updates.
            </p>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => {
            const Icon = getStatusIcon(order.status);

            return (
              <article key={order._id} className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-5">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] pb-5 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/buyer/orders/${order._id}`} className="text-sm font-black text-[#171714] hover:text-[#F25A1D]">
                        {order.orderNumber}
                      </Link>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status] || "bg-[#F6F6F4] text-[#74746F]"}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[#74746F]">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}{" "}
                      - {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Total</p>
                    <p className="mt-1 text-xl font-black text-[#171714]">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {order.items.map((item) => (
                    <div key={`${order._id}-${item.productId}`} className="grid gap-3 rounded-3xl bg-[#F8F8F6] p-3 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
                      <div className="relative h-16 overflow-hidden rounded-2xl bg-white">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-2" />
                        ) : (
                          <div className="grid h-full place-items-center text-[9px] font-black uppercase text-[#8A8A86]">Image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#171714]">{item.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#74746F]">Qty {item.quantity}</p>
                      </div>
                      <p className="self-center text-sm font-black text-[#171714]">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/buyer/orders/${order._id}`}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#171714] hover:bg-[#F6F6F4]"
                >
                  View details
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
