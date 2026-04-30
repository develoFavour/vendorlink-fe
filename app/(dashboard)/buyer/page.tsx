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
  CheckCircle2,
  Heart,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { cartService, type CartResult } from "@/services/cart.service";
import { conversationService, type Conversation } from "@/services/conversation.service";
import { orderService, type BuyerOrder, type OrderStatus } from "@/services/order.service";
import { wishlistService, type WishlistResult } from "@/services/wishlist.service";

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isActiveOrder = (status: OrderStatus) => !["Delivered", "Cancelled"].includes(status);

const getLastSevenDays = () => {
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);

    return {
      date,
      label: dayLabels[date.getDay()],
      total: 0,
      orders: 0,
    };
  });
};

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [cart, setCart] = useState<CartResult>({ items: [], count: 0, subtotal: 0 });
  const [wishlist, setWishlist] = useState<WishlistResult>({ items: [], productIds: [], count: 0 });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [ordersResult, cartResult, wishlistResult, conversationsResult] = await Promise.all([
          orderService.getOrders(),
          cartService.getCart(),
          wishlistService.getWishlist(),
          conversationService.getConversations(),
        ]);

        if (!isActive) return;
        setOrders(ordersResult);
        setCart(cartResult);
        setWishlist(wishlistResult);
        setConversations(conversationsResult);
      } catch {
        toast.error("Unable to load buyer overview.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const activeOrders = useMemo(() => orders.filter((order) => isActiveOrder(order.status)), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((order) => order.status === "Delivered"), [orders]);
  const totalSpend = useMemo(
    () => orders.filter((order) => order.status !== "Cancelled").reduce((total, order) => total + order.total, 0),
    [orders]
  );
  const unreadMessages = useMemo(
    () => conversations.reduce((total, conversation) => total + conversation.unreadByBuyer, 0),
    [conversations]
  );

  const chartData = useMemo(() => {
    const days = getLastSevenDays();

    orders.forEach((order) => {
      if (order.status === "Cancelled") return;

      const createdAt = new Date(order.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      const target = days.find((day) => day.date.getTime() === createdAt.getTime());

      if (target) {
        target.total += order.total;
        target.orders += 1;
      }
    });

    return days.map((day) => ({
      name: day.label,
      Spend: day.total,
      Orders: day.orders,
    }));
  }, [orders]);

  const metrics = [
    {
      label: "Active orders",
      value: activeOrders.length.toString(),
      detail: activeOrders.length ? "Currently being fulfilled" : "No active delivery",
      icon: Truck,
      color: "text-blue-600",
      href: "/buyer/orders",
    },
    {
      label: "Cart value",
      value: formatCurrency(cart.subtotal),
      detail: `${cart.count} item${cart.count === 1 ? "" : "s"} in cart`,
      icon: ShoppingCart,
      color: "text-[#F25A1D]",
      href: "/buyer/cart",
    },
    {
      label: "Saved products",
      value: wishlist.count.toString(),
      detail: "Wishlist picks",
      icon: Heart,
      color: "text-rose-600",
      href: "/buyer/products",
    },
    {
      label: "Total spend",
      value: formatCurrency(totalSpend),
      detail: `${deliveredOrders.length} delivered order${deliveredOrders.length === 1 ? "" : "s"}`,
      icon: WalletCards,
      color: "text-emerald-600",
      href: "/buyer/orders",
    },
  ];

  const recentOrders = orders.slice(0, 4);
  const recentConversations = conversations.slice(0, 4);

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
        Loading buyer overview...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] bg-[#171714] text-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#F7B59C]">Buyer overview</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
              Your local shopping command center
            </h1>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/60">
              Track orders, resume carts, follow vendor conversations, and keep a pulse on your marketplace activity.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/buyer/products" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#F25A1D] px-5 text-sm font-black text-white">
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/buyer/orders" className="inline-flex h-12 items-center rounded-2xl bg-white/10 px-5 text-sm font-black text-white hover:bg-white/15">
                Track orders
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-white/10 p-5">
            <div className="flex items-center justify-between">
              <Sparkles className="h-5 w-5 text-[#F7B59C]" />
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/70">
                Live summary
              </span>
            </div>
            <p className="mt-6 text-sm font-semibold text-white/60">Unread vendor replies</p>
            <p className="mt-1 text-5xl font-black">{unreadMessages}</p>
            <Link href="/buyer/messages" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#F7B59C]">
              Open inbox
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Link key={metric.label} href={metric.href} className="rounded-[26px] bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${metric.color}`} />
                <ArrowRight className="h-4 w-4 text-[#B7B7B2]" />
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{metric.label}</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-[#171714]">{metric.value}</p>
              <p className="mt-2 text-xs font-bold text-[#74746F]">{metric.detail}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-black text-[#171714]">7-day shopping activity</h2>
              <p className="mt-1 text-xs font-semibold text-[#74746F]">Order value from recent marketplace activity.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Synced
            </span>
          </div>

          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="buyerSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F25A1D" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#F25A1D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${Number(value) / 1000}k`} />
                  <ChartTooltip
                    formatter={(value, name) => [name === "Spend" ? formatCurrency(Number(value)) : value, name]}
                    cursor={{ stroke: "#F25A1D", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="Spend" stroke="#F25A1D" strokeWidth={3} fill="url(#buyerSpendGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full animate-pulse rounded-2xl bg-black/[0.03]" />
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#171714]">Cart snapshot</h2>
              <Link href="/buyer/cart" className="text-xs font-black text-[#F25A1D]">View</Link>
            </div>
            {cart.items.length === 0 ? (
              <div className="mt-5 rounded-3xl bg-[#F8F8F6] p-5 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-[#F25A1D]" />
                <p className="mt-3 text-sm font-black text-[#171714]">Your cart is empty</p>
                <Link href="/buyer/products" className="mt-3 inline-flex text-xs font-black text-[#F25A1D]">Find products</Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {cart.items.slice(0, 3).map((item) => (
                  <div key={item.product.id} className="grid grid-cols-[54px_minmax(0,1fr)] gap-3 rounded-3xl bg-[#F8F8F6] p-3">
                    <div className="relative h-14 overflow-hidden rounded-2xl bg-white">
                      {item.product.image ? (
                        <Image src={item.product.image} alt={item.product.name} fill sizes="54px" className="object-contain p-1.5" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#171714]">{item.product.name}</p>
                      <p className="mt-1 text-xs font-bold text-[#74746F]">Qty {item.quantity} - {formatCurrency(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-[#171714]">Vendor replies</h2>
              <Link href="/buyer/messages" className="text-xs font-black text-[#F25A1D]">Open</Link>
            </div>
            {recentConversations.length === 0 ? (
              <p className="mt-5 rounded-3xl bg-[#F8F8F6] p-5 text-sm font-semibold text-[#74746F]">No vendor conversations yet.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {recentConversations.map((conversation) => (
                  <Link key={conversation._id} href={`/buyer/messages?conversation=${conversation._id}`} className="block rounded-3xl bg-[#F8F8F6] p-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-[#F25A1D]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#171714]">{conversation.sellerId.fullName}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-[#74746F]">{conversation.lastMessage || conversation.productId?.name || "Product conversation"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black text-[#171714]">Recent orders</h2>
            <p className="mt-1 text-xs font-semibold text-[#74746F]">Latest purchases and fulfillment status.</p>
          </div>
          <Link href="/buyer/orders" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#171714] hover:bg-[#F6F6F4]">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-6 grid min-h-[220px] place-items-center rounded-3xl bg-[#F8F8F6] p-8 text-center">
            <div>
              <PackageOpen className="mx-auto h-10 w-10 text-[#F25A1D]" />
              <p className="mt-3 text-sm font-black text-[#171714]">No orders yet</p>
              <p className="mt-1 text-xs font-semibold text-[#74746F]">Your first checkout will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {recentOrders.map((order) => {
              const firstItem = order.items[0];

              return (
                <Link key={order._id} href={`/buyer/orders/${order._id}`} className="grid gap-4 rounded-3xl bg-[#F8F8F6] p-4 transition-colors hover:bg-[#F1F1EE] md:grid-cols-[64px_minmax(0,1fr)_auto] md:items-center">
                  <div className="relative h-16 overflow-hidden rounded-2xl bg-white">
                    {firstItem?.image ? (
                      <Image src={firstItem.image} alt={firstItem.name} fill sizes="64px" className="object-contain p-2" />
                    ) : (
                      <div className="grid h-full place-items-center text-[#F25A1D]">
                        <PackageCheck className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[#171714]">{order.orderNumber}</p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-[#74746F]">
                      {firstItem?.name || "Marketplace order"} - {order.items.length} item line{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-lg font-black text-[#171714]">{formatCurrency(order.total)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
