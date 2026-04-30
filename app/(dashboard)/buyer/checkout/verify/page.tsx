"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";

type VerifyState = "verifying" | "success" | "failed";

export default function VerifyPaystackPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const [state, setState] = useState<VerifyState>(reference ? "verifying" : "failed");
  const [message, setMessage] = useState(
    reference ? "Confirming your Paystack payment." : "Payment reference was not found."
  );

  useEffect(() => {
    if (!reference) {
      return;
    }

    orderService
      .verifyPaystackPayment(reference)
      .then((order) => {
        setState("success");
        setMessage("Payment confirmed. Your order is now processing.");
        toast.success("Payment verified successfully.");

        window.setTimeout(() => {
          router.replace(`/buyer/orders?placed=${order._id}`);
        }, 1200);
      })
      .catch(() => {
        setState("failed");
        setMessage("We could not verify this payment. Please check your orders or try again.");
        toast.error("Payment verification failed.");
      });
  }, [reference, router]);

  const isSuccess = state === "success";
  const isFailed = state === "failed";

  return (
    <section className="grid min-h-[70vh] place-items-center rounded-[32px] bg-white p-8 text-center shadow-sm">
      <div className="max-w-md">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : isFailed
                ? "bg-red-50 text-red-600"
                : "bg-[#FFEDE5] text-[#F25A1D]"
          }`}
        >
          {state === "verifying" && <LoaderCircle className="h-7 w-7 animate-spin" />}
          {isSuccess && <CheckCircle2 className="h-7 w-7" />}
          {isFailed && <AlertCircle className="h-7 w-7" />}
        </div>

        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Paystack</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#171714]">
          {state === "verifying" ? "Verifying payment" : isSuccess ? "Payment successful" : "Payment not verified"}
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">{message}</p>

        {isFailed && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/buyer/orders"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#171714] px-6 text-sm font-black text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              View orders
            </Link>
            <Link
              href="/buyer/checkout"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] px-6 text-sm font-black text-[#171714] hover:bg-[#F6F6F4]"
            >
              Back to checkout
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
