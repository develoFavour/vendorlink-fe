"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, PackageCheck, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/seller-products";
import { orderService, type OrderStatus, type PaymentStatus, type SellerOrder, type SellerOrderQueryParams } from "@/services/order.service";

const statuses: (OrderStatus | "All")[] = ["All", "Pending", "Processing", "Ready", "In Transit", "Delivered", "Cancelled"];
const paymentStatuses: (PaymentStatus | "All")[] = ["All", "Pending", "Paid", "Failed"];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Failed: "bg-red-50 text-red-700",
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Processing",
  Processing: "Ready",
  Ready: "In Transit",
  "In Transit": "Delivered",
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [query, setQuery] = useState<SellerOrderQueryParams>({ page: 1, limit: 20, status: "All", paymentStatus: "All", sort: "newest" });
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setIsLoading(true);

      try {
        const result = await orderService.getSellerOrders(query);
        if (!isActive) return;
        setOrders(result.orders);
        setPagination(result.pagination);
      } catch {
        toast.error("Unable to load seller orders.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((total, order) => total + order.subtotal, 0);
    return [
      { label: "Current page", value: orders.length.toString(), icon: PackageCheck },
      { label: "Pending", value: orders.filter((order) => order.status === "Pending").length.toString(), icon: Clock3 },
      { label: "In motion", value: orders.filter((order) => ["Processing", "Ready", "In Transit"].includes(order.status)).length.toString(), icon: Truck },
      { label: "Page revenue", value: formatCurrency(totalRevenue), icon: CheckCircle2 },
    ];
  }, [orders]);

  const applySearch = () => {
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  };

  const updateStatus = async (order: SellerOrder) => {
    const status = nextStatus[order.status];
    if (!status) return;

    setPendingOrderId(order._id);
    try {
      const updated = await orderService.updateSellerOrderStatus(order._id, { status });
      setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      toast.success(`Order moved to ${status}.`);
    } catch {
      toast.error("Unable to update order status.");
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Seller orders</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Fulfillment queue</h1>
            <p className="mt-1 text-sm font-semibold text-[#74746F]">
              Review your marketplace orders, update dispatch status, and keep buyers informed.
            </p>
          </div>
          <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder="Search order or buyer"
              className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-72"
            />
            <button
              type="button"
              onClick={applySearch}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm"
              aria-label="Search orders"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
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

      <section className="rounded-[24px] bg-white shadow-sm sm:rounded-[30px]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <select
              value={query.status || "All"}
              onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as OrderStatus | "All", page: 1 }))}
              className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={query.paymentStatus || "All"}
              onChange={(event) => setQuery((current) => ({ ...current, paymentStatus: event.target.value as PaymentStatus | "All", page: 1 }))}
              className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>{status} payment</option>
              ))}
            </select>
          </div>
          <select
            value={query.sort || "newest"}
            onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value as "newest" | "oldest", page: 1 }))}
            className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-8 text-sm font-black text-[#74746F]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center p-8 text-center">
            <div>
              <PackageCheck className="mx-auto h-10 w-10 text-[#F25A1D]" />
              <h2 className="mt-4 text-2xl font-black text-[#171714]">No seller orders yet</h2>
              <p className="mt-2 text-sm font-semibold text-[#74746F]">Orders containing your products will appear here.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Order</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Items</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Buyer</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Payment</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</TableHead>
                  <TableHead className="text-right pr-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const firstItem = order.items[0];
                  const suggestedStatus = nextStatus[order.status];
                  return (
                    <TableRow key={order._id} className="hover:bg-[#FAFAF9]">
                      <TableCell className="px-5 py-4">
                        <Link href={`/seller/orders/${order._id}`} className="text-sm font-black text-[#171714] hover:text-[#F25A1D]">
                          {order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs font-bold text-[#8A8A86]">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", { month: "short", day: "2-digit", year: "numeric" })}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#F6F6F4]">
                            {firstItem?.image ? (
                              <Image src={firstItem.image} alt={firstItem.name} fill sizes="48px" className="object-contain p-1.5" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-black text-[#171714]">{firstItem?.name || "Order item"}</p>
                            <p className="mt-1 text-xs font-bold text-[#74746F]">{order.itemCount} item(s) - {formatCurrency(order.subtotal)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm font-black text-[#171714]">{order.deliveryAddress.fullName}</p>
                        <p className="mt-1 text-xs font-bold text-[#74746F]">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${paymentStyles[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                        <p className="mt-2 text-xs font-bold text-[#74746F]">{order.paymentMethod}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="flex justify-end gap-2">
                          {suggestedStatus && (
                            <button
                              type="button"
                              disabled={pendingOrderId === order._id}
                              onClick={() => updateStatus(order)}
                              className="rounded-2xl bg-[#171714] px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                            >
                              {suggestedStatus}
                            </button>
                          )}
                          <Link href={`/seller/orders/${order._id}`} className="grid h-9 w-9 place-items-center rounded-2xl border border-black/[0.08] text-[#74746F] hover:bg-[#F6F6F4]">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-4 sm:flex-row sm:p-5">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setQuery((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#74746F] disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <p className="text-xs font-black text-[#8A8A86]">Page {pagination.page} of {pagination.totalPages}</p>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) + 1 }))}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#74746F] disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
