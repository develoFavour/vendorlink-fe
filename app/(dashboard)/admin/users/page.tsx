"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Search, ShieldAlert, UserCog, Users } from "lucide-react";
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
  type AccountStatus,
  type AdminListQuery,
  type AdminPagination,
  type AdminUser,
} from "@/services/admin.service";
import type { UserRole } from "@/services/auth.service";

const DEFAULT_PAGINATION: AdminPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const roles: (UserRole | "All")[] = ["All", "BUYER", "VENDOR", "ADMIN"];
const statuses: (AccountStatus | "All")[] = ["All", "ACTIVE", "SUSPENDED"];

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-NG", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>(DEFAULT_PAGINATION);
  const [query, setQuery] = useState<AdminListQuery>({ page: 1, limit: 20, role: "All", status: "All", sort: "newest" });
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [userToUpdate, setUserToUpdate] = useState<AdminUser | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      setIsLoading(true);

      try {
        const result = await adminService.getUsers(query);
        if (!isActive) return;
        setUsers(result.users);
        setPagination(result.pagination);
      } catch {
        toast.error("Unable to load users.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadUsers();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(() => {
    const suspended = users.filter((user) => user.accountStatus === "SUSPENDED").length;
    const verified = users.filter((user) => user.isVerified).length;
    const admins = users.filter((user) => user.role === "ADMIN").length;

    return [
      { label: "Matched users", value: pagination.total.toString(), detail: "All roles", icon: Users },
      { label: "Verified here", value: verified.toString(), detail: "Email confirmed", icon: BadgeCheck },
      { label: "Suspended here", value: suspended.toString(), detail: "Blocked login", icon: ShieldAlert },
      { label: "Admins here", value: admins.toString(), detail: "Control access", icon: UserCog },
    ];
  }, [pagination.total, users]);

  const applySearch = () => {
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  };

  const confirmStatusUpdate = async () => {
    if (!userToUpdate) return;
    const nextStatus: AccountStatus = userToUpdate.accountStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setPendingUserId(userToUpdate._id);

    try {
      const updated = await adminService.updateUserStatus(userToUpdate._id, nextStatus);
      setUsers((current) => current.map((user) => (user._id === updated._id ? updated : user)));
      toast.success(nextStatus === "SUSPENDED" ? "User suspended." : "User reactivated.");
      setUserToUpdate(null);
    } catch {
      toast.error("Unable to update user status.");
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin users</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">User management</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Manage buyer, vendor, and admin accounts. Suspended users cannot log in or refresh sessions.
            </p>
          </div>
          <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder="Search name, email, phone"
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
            <div key={stat.label} className="rounded-[22px] bg-white p-4 shadow-sm sm:rounded-[26px] sm:p-5">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-3 rounded-[30px] bg-white p-4 shadow-sm md:grid-cols-3">
        <select
          value={query.role || "All"}
          onChange={(event) => setQuery((current) => ({ ...current, role: event.target.value as UserRole | "All", page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          {roles.map((role) => <option key={role} value={role}>{role} role</option>)}
        </select>
        <select
          value={query.status || "All"}
          onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as AccountStatus | "All", page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          {statuses.map((status) => <option key={status} value={status}>{status} status</option>)}
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
        <Table className="min-w-[780px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">User</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Role</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Verification</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Joined</TableHead>
              <TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-[#F25A1D]" />
                  <h2 className="mt-4 text-2xl font-black text-[#171714]">No users found</h2>
                  <p className="mt-2 text-sm font-semibold text-[#74746F]">Try changing your filters or search.</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSuspended = user.accountStatus === "SUSPENDED";
                const isPending = pendingUserId === user._id;

                return (
                  <TableRow key={user._id} className="hover:bg-[#FAFAF9]">
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-black text-[#171714]">{user.fullName}</p>
                      <p className="mt-1 text-xs font-bold text-[#8A8A86]">{user.email}</p>
                      {user.phone ? <p className="mt-1 text-xs font-bold text-[#B0B0AA]">{user.phone}</p> : null}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="rounded-full bg-[#F6F6F4] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#74746F]">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${user.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                      <span className={`ml-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${isSuspended ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {user.accountStatus}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-xs font-bold text-[#74746F]">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setUserToUpdate(user)}
                        className={`h-9 rounded-2xl px-4 text-xs font-black disabled:opacity-50 ${isSuspended ? "bg-[#171714] text-white" : "bg-[#FFEDE5] text-[#F25A1D]"}`}
                      >
                        {isSuspended ? "Reactivate" : "Suspend"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>

        {!isLoading && users.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-5 text-sm font-bold text-[#74746F] md:flex-row">
            <span>Page {pagination.page} of {pagination.totalPages} - {pagination.total} matched users</span>
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

      <Dialog open={Boolean(userToUpdate)} onOpenChange={(open) => !open && setUserToUpdate(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[#171714]">
              {userToUpdate?.accountStatus === "SUSPENDED" ? "Reactivate account?" : "Suspend account?"}
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              {userToUpdate?.accountStatus === "SUSPENDED"
                ? "This user will regain access to their dashboard."
                : "This user will be blocked from logging in and refreshing sessions."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-black/[0.06] bg-[#FAFAF9] p-4">
            <DialogClose className="h-11 rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F]">Cancel</DialogClose>
            <button type="button" onClick={confirmStatusUpdate} disabled={!userToUpdate || pendingUserId === userToUpdate._id} className="h-11 rounded-2xl bg-[#171714] px-5 text-xs font-black text-white disabled:opacity-50">
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
