"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, Clock3, CreditCard, Search, ShieldCheck, Wallet, XCircle } from "lucide-react";
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
  type AdminEarningsSummary,
  type EarningQueryParams,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from "@/services/earning.service";

const DEFAULT_SUMMARY: AdminEarningsSummary = {
  payoutMode: "manual",
  commissionRate: 10,
  grossSales: 0,
  commission: 0,
  vendorNet: 0,
  pendingWithdrawals: 0,
  paidWithdrawals: 0,
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const statuses: (WithdrawalStatus | "All")[] = ["All", "Pending", "Approved", "Processing", "Paid", "Rejected", "Failed"];

const statusStyles: Record<WithdrawalStatus, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-blue-50 text-blue-700",
  Processing: "bg-purple-50 text-purple-700",
  Paid: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Failed: "bg-red-50 text-red-700",
};

type DialogAction = "approve" | "reject" | "process" | "confirm-paid";

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-NG", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Not yet";

export default function AdminEarningsPage() {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [query, setQuery] = useState<EarningQueryParams>({ page: 1, limit: 20, status: "All", sort: "newest" });
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<{
    action: DialogAction;
    withdrawal: WithdrawalRequest;
  } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const refreshData = async () => {
    const [summaryResult, withdrawalsResult] = await Promise.all([
      earningService.getAdminSummary(),
      earningService.getAdminWithdrawals(query),
    ]);
    setSummary(summaryResult);
    setWithdrawals(withdrawalsResult.withdrawals);
    setPagination(withdrawalsResult.pagination);
  };

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [summaryResult, withdrawalsResult] = await Promise.all([
          earningService.getAdminSummary(),
          earningService.getAdminWithdrawals(query),
        ]);
        if (!isActive) return;
        setSummary(summaryResult);
        setWithdrawals(withdrawalsResult.withdrawals);
        setPagination(withdrawalsResult.pagination);
      } catch {
        toast.error("Unable to load admin earnings.");
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
        label: "Gross marketplace sales",
        value: formatCurrency(summary.grossSales),
        detail: "Non-cancelled vendor sales",
        icon: Wallet,
      },
      {
        label: "Platform commission",
        value: formatCurrency(summary.commission),
        detail: `${summary.commissionRate}% commission rate`,
        icon: CreditCard,
      },
      {
        label: "Pending payouts",
        value: formatCurrency(summary.pendingWithdrawals),
        detail: "Awaiting review",
        icon: Clock3,
      },
      {
        label: "Paid payouts",
        value: formatCurrency(summary.paidWithdrawals),
        detail: "Settled withdrawals",
        icon: CheckCircle2,
      },
    ],
    [summary]
  );

  const applySearch = () => {
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  };

  const openAction = (action: DialogAction, withdrawal: WithdrawalRequest) => {
    setDialogState({ action, withdrawal });
    setAdminNote("");
  };

  const runAction = async () => {
    if (!dialogState) return;

    setIsSubmitting(true);

    try {
      if (dialogState.action === "approve") {
        await earningService.approveWithdrawal(dialogState.withdrawal._id, adminNote.trim() || undefined);
        toast.success("Withdrawal approved.");
      } else if (dialogState.action === "reject") {
        await earningService.rejectWithdrawal(dialogState.withdrawal._id, adminNote.trim() || undefined);
        toast.success("Withdrawal rejected.");
      } else if (dialogState.action === "confirm-paid") {
        await earningService.confirmWithdrawalPaid(dialogState.withdrawal._id, adminNote.trim() || undefined);
        toast.success("Withdrawal marked as paid.");
      } else {
        await earningService.processWithdrawal(dialogState.withdrawal._id, adminNote.trim() || undefined);
        toast.success(summary.payoutMode === "manual" ? "Withdrawal marked as paid." : "Paystack transfer started.");
      }

      setDialogState(null);
      await refreshData();
    } catch {
      toast.error("Unable to update withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionCopy = dialogState
    ? {
        approve: {
          title: "Approve withdrawal",
          description: "This reserves the request for payout processing.",
          button: "Approve request",
        },
        reject: {
          title: "Reject withdrawal",
          description: "The amount will return to the vendor's available withdrawal balance.",
          button: "Reject request",
        },
        process: {
          title: summary.payoutMode === "manual" ? "Mark withdrawal paid" : "Process Paystack payout",
          description:
            summary.payoutMode === "manual"
              ? "Manual mode marks this withdrawal as paid after your offline settlement."
              : "Paystack mode creates a transfer recipient and starts a transfer. Confirm paid after the transfer succeeds.",
          button: summary.payoutMode === "manual" ? "Mark paid" : "Start transfer",
        },
        "confirm-paid": {
          title: "Confirm paid",
          description: "Use this after the transfer is confirmed successful.",
          button: "Confirm paid",
        },
      }[dialogState.action]
    : null;

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin earnings</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Marketplace revenue</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Review vendor withdrawal requests, monitor commission, and record manual settlement decisions.
            </p>
          </div>
          <div className="rounded-2xl bg-[#171714] px-5 py-3 text-white">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/50">Payout mode</p>
            <p className="mt-1 text-sm font-black capitalize">{summary.payoutMode.replace("_", " ")}</p>
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
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[24px] bg-white shadow-sm sm:rounded-[30px]">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#171714]">Withdrawal queue</h2>
            <p className="mt-1 text-xs font-semibold text-[#74746F]">Approve, reject, and mark manual vendor settlements as paid.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={query.status || "All"}
              onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as WithdrawalStatus | "All", page: 1 }))}
              className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
              <input
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applySearch();
                }}
                placeholder="Search account or bank"
                className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-64"
              />
              <button
                type="button"
                onClick={applySearch}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm"
                aria-label="Search withdrawals"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Vendor</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Bank</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Amount</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</TableHead>
              <TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">Loading withdrawals...</TableCell>
              </TableRow>
            ) : withdrawals.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-16 text-center">
                  <Banknote className="mx-auto h-10 w-10 text-[#F25A1D]" />
                  <h2 className="mt-4 text-2xl font-black text-[#171714]">No withdrawal requests</h2>
                  <p className="mt-2 text-sm font-semibold text-[#74746F]">Vendor withdrawal requests will appear here.</p>
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal._id} className="hover:bg-[#FAFAF9]">
                  <TableCell className="px-5 py-4">
                    <p className="text-sm font-black text-[#171714]">{withdrawal.vendorName || "Vendor"}</p>
                    <p className="mt-1 text-xs font-bold text-[#8A8A86]">{withdrawal.vendorEmail || "No email"}</p>
                    <p className="mt-1 text-xs font-bold text-[#8A8A86]">{formatDate(withdrawal.createdAt)}</p>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-sm font-black text-[#171714]">{withdrawal.accountName}</p>
                    <p className="mt-1 text-xs font-bold text-[#74746F]">{withdrawal.bankName} - {withdrawal.accountNumber}</p>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-black text-[#171714]">{formatCurrency(withdrawal.amount)}</TableCell>
                  <TableCell className="py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[withdrawal.status]}`}>
                      {withdrawal.status}
                    </span>
                    {withdrawal.paystackTransferReference ? (
                      <p className="mt-2 text-xs font-bold text-[#8A8A86]">{withdrawal.paystackTransferReference}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {withdrawal.status === "Pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openAction("approve", withdrawal)}
                            className="inline-flex h-9 items-center gap-1 rounded-2xl bg-[#171714] px-3 text-xs font-black text-white"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openAction("reject", withdrawal)}
                            className="inline-flex h-9 items-center gap-1 rounded-2xl border border-red-100 bg-red-50 px-3 text-xs font-black text-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      ) : null}
                      {["Pending", "Approved"].includes(withdrawal.status) ? (
                        <button
                          type="button"
                          onClick={() => openAction("process", withdrawal)}
                          className="inline-flex h-9 items-center gap-1 rounded-2xl bg-[#F25A1D] px-3 text-xs font-black text-white"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Pay
                        </button>
                      ) : null}
                      {withdrawal.status === "Processing" ? (
                        <button
                          type="button"
                          onClick={() => openAction("confirm-paid", withdrawal)}
                          className="inline-flex h-9 items-center gap-1 rounded-2xl bg-emerald-600 px-3 text-xs font-black text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirm
                        </button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

        {!isLoading && withdrawals.length > 0 ? (
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
        ) : null}
      </section>

      <Dialog open={Boolean(dialogState)} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-[#171714]">
              {actionCopy?.title || "Withdrawal action"}
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              {actionCopy?.description}
            </DialogDescription>
          </DialogHeader>

          {dialogState ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F8F8F6] p-4">
                <p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Request</p>
                <p className="mt-2 text-2xl font-black text-[#171714]">{formatCurrency(dialogState.withdrawal.amount)}</p>
                <p className="mt-1 text-sm font-bold text-[#74746F]">
                  {dialogState.withdrawal.accountName} - {dialogState.withdrawal.bankName}
                </p>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">Admin note</span>
                <textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  placeholder="Optional internal note"
                  className="min-h-24 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 py-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#C8C8C2]"
                />
              </label>

              <button
                type="button"
                onClick={runAction}
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#171714] px-5 text-sm font-black text-white disabled:opacity-50"
              >
                {isSubmitting ? "Working..." : actionCopy?.button}
              </button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
