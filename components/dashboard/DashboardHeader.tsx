"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Command, Mail, Menu, Plus, Search, ShoppingBag } from "lucide-react";
import type { DashboardRole } from "@/types/dashboard";
import { authService, type AuthUser } from "@/services/auth.service";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebarContent } from "@/components/dashboard/DashboardSidebar";

type DashboardHeaderProps = {
	role: DashboardRole;
};

type StoreSummary = {
	_id: string;
	storeName: string;
	slug: string;
	category?: string;
	status: string;
} | null;

const roleLabels: Record<DashboardRole, string> = {
	BUYER: "buyer account",
	VENDOR: "seller account",
	ADMIN: "admin account",
};

const roleRoots: Record<DashboardRole, string> = {
	BUYER: "/buyer",
	VENDOR: "/seller",
	ADMIN: "/admin",
};

const getInitials = (name?: string) => {
	const parts = (name || "VL").trim().split(/\s+/).filter(Boolean);

	return parts
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();
};

export function DashboardHeader({ role }: DashboardHeaderProps) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [store, setStore] = useState<StoreSummary>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		let isActive = true;

		const loadSession = async () => {
			try {
				const response = await authService.me();
				if (!isActive) return;
				setUser(response.data.user);
				setStore(response.data.store || null);
			} catch {
				if (!isActive) return;
				setUser(null);
				setStore(null);
			}
		};

		void loadSession();

		return () => {
			isActive = false;
		};
	}, []);

	const activeRole = user?.role || role;
	const settingsHref = `${roleRoots[activeRole]}/settings`;
	const messagesHref = `${roleRoots[activeRole]}/messages`;
	const displayName = user?.fullName || "VendorLink user";
	const accountLabel = useMemo(() => {
		if (activeRole === "VENDOR" && store?.storeName) return store.storeName;
		return roleLabels[activeRole];
	}, [activeRole, store?.storeName]);

	return (
		<header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center gap-3 border-b border-black/[0.06] bg-white px-3 py-3 lg:grid lg:h-16 lg:grid-cols-[240px_1fr_auto] lg:px-4 lg:py-0">
			<div className="flex shrink-0 items-center gap-2">
				<Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<SheetTrigger asChild>
						<button
							type="button"
							className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5F5F4] text-[#40403D] md:hidden"
							aria-label="Open dashboard menu"
						>
							<Menu className="h-4 w-4" />
						</button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="w-[86vw] max-w-[320px] gap-0 border-r border-black/[0.06] bg-white p-0"
					>
						<SheetHeader className="border-b border-black/[0.06] p-4">
							<SheetTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-[#161616]">
								<span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F25A1D] text-white">
									<ShoppingBag className="h-4 w-4" />
								</span>
								VendorLink
							</SheetTitle>
							<SheetDescription className="text-xs font-semibold text-[#8A8A86]">
								{accountLabel}
							</SheetDescription>
						</SheetHeader>
						<DashboardSidebarContent role={activeRole} onNavigate={() => setIsMenuOpen(false)} />
					</SheetContent>
				</Sheet>

				<Link href="/" className="flex items-center gap-2">
					<span className="hidden h-8 w-8 items-center justify-center rounded-xl bg-[#F25A1D] text-white md:flex">
						<ShoppingBag className="h-4 w-4" />
					</span>
					<span className="hidden text-lg font-black tracking-tight text-[#161616] sm:inline">
						VendorLink
					</span>
				</Link>
			</div>

			<div className="order-3 flex w-full items-center gap-3 rounded-full bg-[#F5F5F4] px-4 py-2.5 text-[#8A8A86] lg:order-none lg:max-w-lg">
				<Search className="h-4 w-4" />
				<input
					placeholder="Search..."
					className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[#8A8A86]"
				/>
				<span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-[#161616] shadow-sm">
					<Command className="h-3 w-3" /> K
				</span>
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
				{activeRole === "VENDOR" && (
					<Link
						href="/seller/products/new"
						className="hidden items-center gap-1.5 rounded-full bg-[#F25A1D] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#de4c12] sm:flex"
					>
						<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
						<span>Add new product</span>
					</Link>
				)}
				{activeRole != "ADMIN" && (
					<Link
						href={messagesHref}
						className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F4] text-[#40403D]"
						aria-label="Open messages"
					>
						<Mail className="h-4 w-4" />
						<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
					</Link>
				)}
				<button
					type="button"
					className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F4] text-[#40403D] sm:flex"
					aria-label="Open notifications"
				>
					<Bell className="h-4 w-4" />
					<span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F25A1D]" />
				</button>
				<Link
					href={settingsHref}
					className="flex items-center gap-3 rounded-full bg-[#F8F8F7] py-1 pl-1 pr-3"
				>
					<span className="grid h-9 w-9 place-items-center rounded-full bg-[#171714] text-xs font-black text-white">
						{getInitials(displayName)}
					</span>
					<span className="hidden text-left sm:block">
						<span className="block max-w-40 truncate text-sm font-black leading-4 text-[#161616]">
							{displayName}
						</span>
						<span className="block max-w-40 truncate text-xs font-medium text-[#8A8A86]">
							{accountLabel}
						</span>
					</span>
				</Link>
			</div>
		</header>
	);
}
