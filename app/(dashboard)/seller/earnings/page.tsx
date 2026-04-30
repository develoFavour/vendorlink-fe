"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, Clock3, CreditCard, Landmark, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/seller-products";
import {
  earningService,
  type EarningQueryParams,
  type SellerEarningsOverview,
  type VendorEarning,
  type VendorEarningStatus,
} from "@/services/earning.service";

const DEFAULT_OVERVIEW: SellerEarningsOverview = {
  balance: {
    grossSales: 0,
    commission: 0,
    netEarnings: 0,
    pendingBalance: 0,
    availableBalance: 0,
    reservedBalance: 0,
    withdrawnBalance: 0,
    cancelledBalance: 0,
  },
  commissionRate: 10,
  payoutMode: "manual",
  minimumWithdrawalAmount: 1000,
  recentEarnings: [],
  withdrawals: [],
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const statuses: (VendorEarningStatus | "All")[] = ["All", "Pending", "Available", "Cancelled"];

const statusStyles: Record<VendorEarningStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Available: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const withdrawalStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-blue-50 text-blue-700",
  Processing: "bg-purple-50 text-purple-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Failed: "bg-red-50 text-red-700",
};

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Not yet";

export default function SellerEarningsPage() {
  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [earnings, setEarnings] = useState<VendorEarning[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [query, setQuery] = useState<EarningQueryParams>({ page: 1, limit: 20, status: "All", sort: "newest" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    vendorNote: "",
  });

  const refreshData = async () => {
    const [overviewResult, earningsResult] = await Promise.all([
      earningService.getSellerOverview(),
      earningService.getSellerEarnings(query),
    ]);
    setOverview(overviewResult);
    setEarnings(earningsResult.earnings);
    setPagination(earningsResult.pagination);
  };

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [overviewResult, earningsResult] = await Promise.all([
          earningService.getSellerOverview(),
          earningService.getSellerEarnings(query),
        ]);
        if (!isActive) return;
        setOverview(overviewResult);
        setEarnings(earningsResult.earnings);
        setPagination(earningsResult.pagination);
      } catch {
        toast.error("Unable to load earnings.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(
    () => [
      {
        label: "Available balance",
        value: formatCurrency(overview.balance.availableBalance),
        detail: "Ready for withdrawal",
        icon: Wallet,
      },
      {
        label: "Pending clearance",
        value: formatCurrency(overview.balance.pendingBalance),
        detail: "Awaiting delivery",
        icon: Clock3,
      },
      {
        label: "Withdrawn",
        value: formatCurrency(overview.balance.withdrawnBalance),
        detail: "Settled payouts",
        icon: CheckCircle2,
      },
      {
        label: "Platform commission",
        value: formatCurrency(overview.balance.commission),
        detail: `${overview.commissionRate}% marketplace fee`,
        icon: CreditCard,
      },
    ],
    [overview]
  );

  const submitWithdrawal = async () => {
    const amount = Number(withdrawalForm.amount);

    if (!Number.isFinite(amount) || amount < overview.minimumWithdrawalAmount) {
      toast.error(`Minimum withdrawal is ${formatCurrency(overview.minimumWithdrawalAmount)}.`);
      return;
    }

    if (amount > overview.balance.availableBalance) {
      toast.error("Withdrawal amount is higher than your available balance.");
      return;
    }

    if (!withdrawalForm.bankName.trim() || !withdrawalForm.accountNumber.trim() || !withdrawalForm.accountName.trim()) {
      toast.error("Bank name, account number, and account name are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await earningService.requestWithdrawal({
        amount,
        bankName: withdrawalForm.bankName.trim(),
        accountNumber: withdrawalForm.accountNumber.trim(),
        accountName: withdrawalForm.accountName.trim(),
        vendorNote: withdrawalForm.vendorNote.trim() || undefined,
      });
      toast.success("Withdrawal request submitted.");
      setIsWithdrawalOpen(false);
      setWithdrawalForm({ amount: "", bankName: "", accountNumber: "", accountName: "", vendorNote: "" });
      await refreshData();
    } catch {
      toast.error("Unable to submit withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Seller earnings</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Payouts and revenue</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Track delivered-order earnings, marketplace commission, reserved withdrawal requests, and settlement history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsWithdrawalOpen(true)}
            disabled={overview.balance.availableBalance < overview.minimumWithdrawalAmount}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#171714] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Request withdrawal
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[26px] bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[30px] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-black/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-[#171714]">Earnings ledger</h2>
              <p className="mt-1 text-xs font-semibold text-[#74746F]">One row per vendor fulfillment.</p>
            </div>
            <select
              value={query.status || "All"}
              onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as VendorEarningStatus | "All", page: 1 }))}
              className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Order</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Gross</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Commission</TableHead>
                <TableHead className="py-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Net</TableHead>
                <TableHead className="pr-5 py-4 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">Loading earnings...</TableCell>
                </TableRow>
              ) : earnings.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-6 py-16 text-center">
                    <Banknote className="mx-auto h-10 w-10 text-[#F25A1D]" />
                    <h2 className="mt-4 text-2xl font-black text-[#171714]">No earnings yet</h2>
                    <p className="mt-2 text-sm font-semibold text-[#74746F]">Delivered orders will release earnings here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                earnings.map((earning) => (
                  <TableRow key={earning._id} className="hover:bg-[#FAFAF9]">
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-black text-[#171714]">{earning.orderNumber}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{formatDate(earning.availableAt || earning.createdAt)}</p>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-black text-[#171714]">{formatCurrency(earning.itemsSubtotal)}</TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{formatCurrency(earning.commissionAmount)}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{earning.commissionRate}%</p>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-black text-[#171714]">{formatCurrency(earning.netAmount)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[earning.status]}`}>
                        {earning.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {!isLoading && earnings.length > 0 ? (
            <div className="flex items-center justify-between border-t border-black/[0.06] p-5">
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
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-[30px] bg-[#171714] p-6 text-white shadow-sm">
            <Landmark className="h-5 w-5 text-[#FFB39A]" />
            <p className="mt-5 text-xs font-black uppercase tracking-wider text-white/50">Settlement mode</p>
            <h2 className="mt-2 text-2xl font-black capitalize">{overview.payoutMode.replace("_", " ")}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
              Minimum withdrawal is {formatCurrency(overview.minimumWithdrawalAmount)}. Pending requests reserve balance until paid or rejected.
            </p>
          </div>

          <div className="rounded-[30px] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-[#171714]">Withdrawal history</h2>
            <div className="mt-4 space-y-3">
              {overview.withdrawals.length === 0 ? (
                <p className="rounded-2xl bg-[#F8F8F6] p-4 text-sm font-semibold text-[#74746F]">No withdrawals requested yet.</p>
              ) : (
                overview.withdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="rounded-2xl border border-black/[0.06] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#171714]">{formatCurrency(withdrawal.amount)}</p>
                        <p className="mt-1 text-xs font-bold text-[#74746F]">{withdrawal.bankName} - {withdrawal.accountNumber}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${withdrawalStyles[withdrawal.status]}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-bold text-[#8A8A86]">{formatDate(withdrawal.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>

      <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[28px] bg-white p-6 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-[#171714]">Request withdrawal</DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              Available balance: {formatCurrency(overview.balance.availableBalance)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {[
              { label: "Amount", key: "amount", placeholder: "5000", type: "number" },
              { label: "Bank name", key: "bankName", placeholder: "Access Bank", type: "text" },
              { label: "Account number", key: "accountNumber", placeholder: "0123456789", type: "text" },
              { label: "Account name", key: "accountName", placeholder: "Vendor business name", type: "text" },
            ].map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">{field.label}</span>
                <input
                  type={field.type}
                  value={withdrawalForm[field.key as keyof typeof withdrawalForm]}
                  onChange={(event) => setWithdrawalForm((current) => ({ ...current, [field.key]: event.target.value }))}
                  placeholder={field.placeholder}
                  className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-sm font-bold text-[#171714] outline-none placeholder:text-[#C8C8C2]"
                />
              </label>
            ))}

            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Note</span>
              <textarea
                value={withdrawalForm.vendorNote}
                onChange={(event) => setWithdrawalForm((current) => ({ ...current, vendorNote: event.target.value }))}
                placeholder="Optional payout note"
                className="min-h-24 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 py-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#C8C8C2]"
              />
            </label>

            <button
              type="button"
              onClick={submitWithdrawal}
              disabled={isSubmitting}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-2xl bg-[#F25A1D] px-5 text-sm font-black text-white disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
