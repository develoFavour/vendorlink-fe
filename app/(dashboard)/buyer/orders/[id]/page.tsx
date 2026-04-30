"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, MapPin, PackageCheck, RefreshCcw, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { orderService, type BuyerOrder, type OrderStatus } from "@/services/order.service";

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Ready: "bg-indigo-50 text-indigo-700",
  "In Transit": "bg-purple-50 text-purple-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const paymentStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Failed: "bg-red-50 text-red-700",
};

const renderStatusIcon = (status: OrderStatus, className = "h-3.5 w-3.5") => {
  if (status === "Delivered") return <CheckCircle2 className={className} />;
  if (status === "In Transit") return <Truck className={className} />;
  if (status === "Cancelled") return <XCircle className={className} />;
  if (status === "Pending") return <Clock3 className={className} />;
  return <PackageCheck className={className} />;
};

export default function BuyerOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<BuyerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    orderService
      .getOrder(params.id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const fulfillments = useMemo(() => {
    if (!order) return [];
    if (order.fulfillments?.length) return order.fulfillments;

    return [
      {
        vendorId: "vendor",
        items: order.items,
        subtotal: order.subtotal,
        status: order.status,
        statusHistory: [],
      },
    ];
  }, [order]);

  const canCancelImmediately = useMemo(
    () => Boolean(order) && fulfillments.every((fulfillment) => fulfillment.status === "Pending"),
    [fulfillments, order]
  );

  const canRequestRefund = useMemo(
    () => Boolean(order) && order?.status !== "Cancelled" && !canCancelImmediately,
    [canCancelImmediately, order]
  );

  const cancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);

    try {
      const updated = await orderService.cancelOrder(order._id);
      setOrder(updated);
      toast.success("Order cancelled successfully.");
    } catch {
      toast.error("Unable to cancel this order.");
    } finally {
      setIsCancelling(false);
    }
  };

  const requestRefund = async () => {
    if (!order) return;

    if (!refundReason.trim()) {
      toast.error("Please tell us why you want a refund.");
      return;
    }

    setIsRequestingRefund(true);

    try {
      const refund = await orderService.requestRefund(order._id, refundReason);
      setRefundReason("");
      toast.success(`Refund request submitted. Estimated refund: ${formatCurrency(refund.finalRefundAmount)}.`);
    } catch {
      toast.error("Unable to submit refund request.");
    } finally {
      setIsRequestingRefund(false);
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
        <Link href="/buyer/orders" className="mt-5 inline-flex rounded-2xl bg-[#171714] px-5 py-3 text-xs font-black text-white">
          Back to orders
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <Link href="/buyer/orders" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#8A8A86] hover:text-[#F25A1D]">
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight text-[#171714]">{order.orderNumber}</h1>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}>
                {renderStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#74746F]">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              - {order.paymentMethod}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-[#F6F6F4] px-5 py-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#8A8A86]">Payment</p>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${paymentStyles[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="rounded-3xl bg-[#171714] px-5 py-4 text-white">
              <p className="text-[11px] font-black uppercase tracking-wider text-white/60">Total</p>
              <p className="mt-1 text-2xl font-black">{formatCurrency(order.total)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-5">
          {fulfillments.map((fulfillment, index) => {
            return (
              <article key={`${fulfillment.vendorId}-${index}`} className="rounded-[30px] bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">
                      Vendor package {index + 1}
                    </p>
                    <h2 className="mt-2 text-xl font-black text-[#171714]">{fulfillment.items.length} product line(s)</h2>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[fulfillment.status]}`}>
                    {renderStatusIcon(fulfillment.status)}
                    {fulfillment.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {fulfillment.items.map((item) => (
                    <div key={`${fulfillment.vendorId}-${item.productId}`} className="grid gap-4 rounded-3xl bg-[#F8F8F6] p-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center">
                      <div className="relative h-20 overflow-hidden rounded-2xl bg-white">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="76px" className="object-contain p-2" />
                        ) : (
                          <div className="grid h-full place-items-center text-[9px] font-black uppercase text-[#8A8A86]">Image</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#171714]">{item.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#74746F]">Qty {item.quantity} - {formatCurrency(item.price)} each</p>
                      </div>
                      <p className="text-lg font-black text-[#171714]">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>

                {fulfillment.trackingNote && (
                  <div className="mt-4 rounded-2xl bg-[#FFEDE5] p-4 text-sm font-semibold text-[#9F3E17]">
                    {fulfillment.trackingNote}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Delivery address</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm font-semibold text-[#74746F]">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Recipient</p>
                <p className="mt-1 font-black text-[#171714]">{order.deliveryAddress.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Phone</p>
                <p className="mt-1 font-black text-[#171714]">{order.deliveryAddress.phone}</p>
              </div>
              <p className="leading-6 text-[#171714]">
                {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </p>
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
              <AlertCircle className="h-5 w-5 text-[#F25A1D]" />
              <h2 className="text-lg font-black text-[#171714]">Order help</h2>
            </div>

            {canCancelImmediately ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-[#F8F8F6] p-4 text-sm font-semibold leading-6 text-[#74746F]">
                  You can cancel this order now because no vendor has started fulfillment.
                </p>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={cancelOrder}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 text-sm font-black text-white disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {isCancelling ? "Cancelling..." : "Cancel order"}
                </button>
              </div>
            ) : canRequestRefund ? (
              <div className="mt-5 space-y-4">
                <p className="rounded-2xl bg-[#F8F8F6] p-4 text-sm font-semibold leading-6 text-[#74746F]">
                  This order is already in progress. Submit a refund request and an admin will review it. A 10% deduction may apply after dispatch.
                </p>
                <textarea
                  value={refundReason}
                  onChange={(event) => setRefundReason(event.target.value)}
                  placeholder="Why do you want a refund?"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 py-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2]"
                />
                <button
                  type="button"
                  disabled={isRequestingRefund}
                  onClick={requestRefund}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#171714] text-sm font-black text-white disabled:opacity-50"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {isRequestingRefund ? "Submitting..." : "Request refund"}
                </button>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-[#F8F8F6] p-4 text-sm font-semibold leading-6 text-[#74746F]">
                No cancellation or refund action is available for this order right now.
              </p>
            )}
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#171714]">Cost summary</h2>
            <div className="mt-5 space-y-3 text-sm font-bold">
              <div className="flex justify-between text-[#74746F]">
                <span>Subtotal</span>
                <span className="text-[#171714]">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#74746F]">
                <span>Delivery</span>
                <span className="text-[#171714]">{order.deliveryFee === 0 ? "Free" : formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-black/[0.08] pt-4">
                <div className="flex justify-between text-base font-black text-[#171714]">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
