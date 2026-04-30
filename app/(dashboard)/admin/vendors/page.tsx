"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Package, Search, ShieldAlert, Store, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  adminService,
  type AdminListQuery,
  type AdminPagination,
  type AdminVendor,
  type StoreStatus,
} from "@/services/admin.service";

const DEFAULT_PAGINATION: AdminPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const statuses: (StoreStatus | "All")[] = ["All", "ACTIVE", "SUSPENDED", "PENDING"];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-NG", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>(DEFAULT_PAGINATION);
  const [query, setQuery] = useState<AdminListQuery>({ page: 1, limit: 20, status: "All", sort: "newest" });
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingStoreId, setPendingStoreId] = useState<string | null>(null);
  const [vendorToUpdate, setVendorToUpdate] = useState<AdminVendor | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadVendors = async () => {
      setIsLoading(true);

      try {
        const result = await adminService.getVendors(query);
        if (!isActive) return;
        setVendors(result.vendors);
        setPagination(result.pagination);
      } catch {
        toast.error("Unable to load vendors.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadVendors();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(() => {
    const active = vendors.filter((vendor) => vendor.status === "ACTIVE").length;
    const suspended = vendors.filter((vendor) => vendor.status === "SUSPENDED").length;
    const products = vendors.reduce((total, vendor) => total + vendor.productCount, 0);

    return [
      { label: "Matched vendors", value: pagination.total.toString(), detail: "Storefronts", icon: Store },
      { label: "Active here", value: active.toString(), detail: "Can sell", icon: BadgeCheck },
      { label: "Suspended here", value: suspended.toString(), detail: "Login blocked", icon: ShieldAlert },
      { label: "Products here", value: products.toString(), detail: "Vendor catalog", icon: Package },
    ];
  }, [pagination.total, vendors]);

  const applySearch = () => {
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  };

  const confirmVendorStatus = async () => {
    if (!vendorToUpdate) return;
    const nextStatus: StoreStatus = vendorToUpdate.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setPendingStoreId(vendorToUpdate._id);

    try {
      const updated = await adminService.updateVendorStatus(vendorToUpdate._id, nextStatus);
      setVendors((current) => current.map((vendor) => (vendor._id === updated._id ? updated : vendor)));
      toast.success(nextStatus === "SUSPENDED" ? "Vendor suspended." : "Vendor reactivated.");
      setVendorToUpdate(null);
    } catch {
      toast.error("Unable to update vendor status.");
    } finally {
      setPendingStoreId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin vendors</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Vendor management</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Vendors onboard automatically. Admins moderate storefront access, suspend unsafe vendors, and reactivate reviewed stores.
            </p>
          </div>
          <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder="Search store, vendor, category"
              className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-80"
            />
            <button type="button" onClick={applySearch} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm">
              <Search className="h-4 w-4" />
            </button>
          </div>
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

      <section className="grid gap-3 rounded-[30px] bg-white p-4 shadow-sm md:grid-cols-2">
        <select
          value={query.status || "All"}
          onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as StoreStatus | "All", page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          {statuses.map((status) => <option key={status} value={status}>{status} stores</option>)}
        </select>
        <select
          value={query.sort || "newest"}
          onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value as "newest" | "oldest", page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-[24px] bg-white shadow-sm sm:rounded-[30px]">
        <div className="overflow-x-auto">
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Store</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Vendor</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Catalog</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Status</TableHead>
              <TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">Loading vendors...</TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-16 text-center">
                  <Store className="mx-auto h-10 w-10 text-[#F25A1D]" />
                  <h2 className="mt-4 text-2xl font-black text-[#171714]">No vendors found</h2>
                  <p className="mt-2 text-sm font-semibold text-[#74746F]">Try changing your filters or search.</p>
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => {
                const isSuspended = vendor.status === "SUSPENDED";
                const isPending = pendingStoreId === vendor._id;

                return (
                  <TableRow key={vendor._id} className="hover:bg-[#FAFAF9]">
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-black text-[#171714]">{vendor.storeName}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{vendor.category} - {vendor.slug}</p>
                      <p className="mt-1 max-w-[320px] truncate text-xs font-bold text-[#B0B0AA]">{vendor.address || "No address provided"}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{vendor.vendorName}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{vendor.vendorEmail}</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${vendor.vendorId?.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {vendor.vendorId?.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{vendor.productCount} products</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">Joined {formatDate(vendor.createdAt)}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${isSuspended ? "bg-red-50 text-red-600" : vendor.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {vendor.status}
                      </span>
                      <span className={`ml-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${vendor.vendorStatus === "SUSPENDED" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {vendor.vendorStatus}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products?search=${encodeURIComponent(vendor.storeName)}`} className="inline-flex h-9 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#74746F] hover:bg-[#F6F6F4]">
                          <Users className="h-4 w-4" />
                          Products
                        </Link>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setVendorToUpdate(vendor)}
                          className={`h-9 rounded-2xl px-4 text-xs font-black disabled:opacity-50 ${isSuspended ? "bg-[#171714] text-white" : "bg-[#FFEDE5] text-[#F25A1D]"}`}
                        >
                          {isSuspended ? "Reactivate" : "Suspend"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>

        {!isLoading && vendors.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-5 text-sm font-bold text-[#74746F] md:flex-row">
            <span>Page {pagination.page} of {pagination.totalPages} - {pagination.total} matched vendors</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={!pagination.hasPrevPage} onClick={() => setQuery((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))} className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black disabled:opacity-40">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <button type="button" disabled={!pagination.hasNextPage} onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) + 1 }))} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#171714] px-4 text-xs font-black text-white disabled:opacity-40">
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <Dialog open={Boolean(vendorToUpdate)} onOpenChange={(open) => !open && setVendorToUpdate(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[#171714]">
              {vendorToUpdate?.status === "SUSPENDED" ? "Reactivate vendor?" : "Suspend vendor?"}
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              {vendorToUpdate?.status === "SUSPENDED"
                ? "The vendor will regain access to their seller dashboard and storefront."
                : "The storefront will be suspended and the vendor account will be blocked from login."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-black/[0.06] bg-[#FAFAF9] p-4">
            <DialogClose className="h-11 rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F]">Cancel</DialogClose>
            <button type="button" onClick={confirmVendorStatus} disabled={!vendorToUpdate || pendingStoreId === vendorToUpdate._id} className="h-11 rounded-2xl bg-[#171714] px-5 text-xs font-black text-white disabled:opacity-50">
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
