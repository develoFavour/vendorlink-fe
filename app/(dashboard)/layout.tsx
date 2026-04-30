import { cookies } from "next/headers";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { normalizeDashboardRole } from "@/lib/dashboard-access";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const role = normalizeDashboardRole(cookieStore.get("auth_role")?.value);

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-[#F3F3F1] font-sans text-[#171714]">
			<DashboardHeader role={role} />
			<main className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
				<DashboardSidebar role={role} />
				<section className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-5">
					{children}
				</section>
			</main>
		</div>
	);
}
