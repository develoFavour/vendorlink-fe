"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
	DASHBOARD_NAV_ITEMS,
	DASHBOARD_ROLE_ROOTS,
} from "@/constants/dashboard-nav.const";
import type { DashboardRole } from "@/types/dashboard";
import { authService } from "@/services/auth.service";

type DashboardSidebarProps = {
	role: DashboardRole;
};

type DashboardSidebarContentProps = DashboardSidebarProps & {
	onNavigate?: () => void;
};

export function DashboardSidebarContent({ role, onNavigate }: DashboardSidebarContentProps) {
	const pathname = usePathname();
	const router = useRouter();
	const navItems = DASHBOARD_NAV_ITEMS.filter((item) =>
		item.roles.includes(role),
	);
	const roleRoot = DASHBOARD_ROLE_ROOTS[role];

	const handleLogout = async () => {
		try {
			await authService.logout();
			toast.success("Logged out successfully.");
		} catch {
			toast.error("Session ended locally.");
		} finally {
			onNavigate?.();
			router.refresh();
			router.replace("/auth/login");
		}
	};

	return (
		<>
			<div className="px-4 pb-4 pt-5">
				<p className="mb-3 px-1 text-xs font-semibold text-[#8A8A86]">Menu</p>
				<nav className="flex flex-col gap-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const href = item.path ? `${roleRoot}/${item.path}` : roleRoot;
						const isActive = pathname === href;

						return (
							<Link
								key={href}
								href={href}
								onClick={onNavigate}
								className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 ${
									isActive
										? "bg-[#FFEDE5] text-[#E95516]"
										: "text-[#74746F] hover:bg-[#F6F6F4] hover:text-[#171714]"
								}`}
							>
								<Icon
									className={`h-4.5 w-4.5 ${isActive ? "text-[#E95516]" : "text-[#8A8A86]"}`}
									strokeWidth={2}
								/>
								{item.title}
							</Link>
						);
					})}
				</nav>
			</div>

			<div className="mt-auto border-t border-black/[0.06] px-4 py-5">
				<p className="mb-3 px-1 text-xs font-semibold text-[#8A8A86]">Tools</p>
				<div className="space-y-1 text-sm font-semibold text-[#74746F]">
					{/* <Link href={`${roleRoot}/settings`} className="block rounded-xl px-3.5 py-3 hover:bg-[#F6F6F4] hover:text-[#171714]">
            Settings
          </Link>
          <Link href="/auth/login" className="block rounded-xl px-3.5 py-3 hover:bg-[#F6F6F4] hover:text-[#171714]">
            Get Help
          </Link> */}
					<button
						type="button"
						onClick={handleLogout}
						className="flex w-full items-center gap-2 rounded-xl px-3.5 py-3 text-left text-red-600 hover:bg-red-500/[0.06]"
					>
						<LogOut className="h-4 w-4" />
						Logout
					</button>
				</div>
			</div>
		</>
	);
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
	return (
		<aside className="hidden h-full w-60 shrink-0 flex-col overflow-hidden border-r border-black/[0.06] bg-white md:flex">
			<DashboardSidebarContent role={role} />
		</aside>
	);
}
