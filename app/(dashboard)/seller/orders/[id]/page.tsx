"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, PackageCheck, Phone, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { orderService, type OrderStatus, type SellerOrder } from "@/services/order.service";

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const nextOptions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Ready", "Cancelled"],
  Ready: ["In Transit", "Cancelled"],
  "In Transit": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

export default function SellerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    orderService
      .getSellerOrder(params.id)
      .then((result) => {
        setOrder(result);
        setSelectedStatus("");
      })
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const statusOptions = useMemo(() => {
    if (!order) return [];
    return nextOptions[order.status] || [];
  }, [order]);

  const saveStatus = async () => {
    if (!order || !selectedStatus) return;
    setIsSaving(true);

    try {
      const updated = await orderService.updateSellerOrderStatus(order._id, {
        status: selectedStatus,
        note,
      });
      setOrder(updated);
      setSelectedStatus("");
      setNote("");
      toast.success("Order status updated.");
    } catch {
      toast.error("Unable to update order status.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <section className="rounded-[30px] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[#171714]">Order not found</h1>
        <Link href="/seller/orders" className="mt-5 inline-flex rounded-2xl bg-[#171714] px-5 py-3 text-xs font-black text-white">
          Back to orders
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <Link href="/seller/orders" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#8A8A86] hover:text-[#F25A1D]">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-[#171714]">{order.orderNumber}</h1>
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#74746F]">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              - {order.paymentMethod} - {order.paymentStatus}
            </p>
          </div>
          <div className="rounded-3xl bg-[#F6F6F4] px-5 py-4 text-right">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#8A8A86]">Seller subtotal</p>
            <p className="mt-1 text-2xl font-black text-[#171714]">{formatCurrency(order.subtotal)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <PackageCheck className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Your items in this order</h2>
            </div>
            <div className="mt-5 space-y-3">
              {order.items.map((item) => (
                <article key={`${order._id}-${item.productId}`} className="grid gap-4 rounded-3xl bg-[#F8F8F6] p-4 sm:grid-cols-[82px_minmax(0,1fr)_auto] sm:items-center">
                  <div className="relative h-20 overflow-hidden rounded-2xl bg-white">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="82px" className="object-contain p-2" />
                    ) : (
                      <div className="grid h-full place-items-center text-[9px] font-black uppercase text-[#8A8A86]">Image</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#171714]">{item.name}</h3>
                    <p className="mt-1 text-xs font-bold text-[#74746F]">Qty {item.quantity} - {formatCurrency(item.price)} each</p>
                  </div>
                  <p className="text-lg font-black text-[#171714]">{formatCurrency(item.lineTotal)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Fulfillment timeline</h2>
            </div>
            <div className="mt-5 space-y-3">
              {order.statusHistory.length === 0 ? (
                <p className="text-sm font-semibold text-[#74746F]">No status updates yet.</p>
              ) : (
                order.statusHistory.map((history, index) => (
                  <div key={`${history.status}-${history.updatedAt}-${index}`} className="rounded-3xl bg-[#F8F8F6] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[history.status]}`}>
                        {history.status}
                      </span>
                      <span className="text-xs font-bold text-[#8A8A86]">
                        {new Date(history.updatedAt).toLocaleString("en-NG", {
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {history.note && <p className="mt-3 text-sm font-semibold text-[#74746F]">{history.note}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Update status</h2>
            </div>
            {statusOptions.length === 0 ? (
              <p className="mt-5 rounded-2xl bg-[#F8F8F6] p-4 text-sm font-semibold text-[#74746F]">
                This fulfillment is locked at {order.status}.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-[#74746F]">Next status</span>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                    className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-sm font-black text-[#171714] outline-none"
                  >
                    <option value="">Select status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-[#74746F]">Dispatch note</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Pickup code, rider contact, delivery note"
                    rows={4}
                    className="mt-2 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 py-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2]"
                  />
                </label>
                <button
                  type="button"
                  disabled={!selectedStatus || isSaving}
                  onClick={saveStatus}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F25A1D] text-sm font-black text-white disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save update"}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Buyer delivery</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm font-semibold text-[#74746F]">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Name</p>
                <p className="mt-1 font-black text-[#171714]">{order.deliveryAddress.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Phone</p>
                <p className="mt-1 inline-flex items-center gap-2 font-black text-[#171714]">
                  <Phone className="h-4 w-4 text-[#F25A1D]" />
                  {order.deliveryAddress.phone}
                </p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Address</p>
                <p className="mt-1 leading-6 text-[#171714]">
                  {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </p>
              </div>
              {order.deliveryAddress.note && (
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Note</p>
                  <p className="mt-2 leading-6">{order.deliveryAddress.note}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Payment</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-[#F8F8F6] p-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Method</p>
                <p className="mt-1 font-black text-[#171714]">{order.paymentMethod}</p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</p>
                <p className="mt-1 font-black text-[#171714]">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
