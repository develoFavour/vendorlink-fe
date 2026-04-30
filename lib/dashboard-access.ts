import type { DashboardRole } from "@/types/dashboard";

const roleFallback: DashboardRole = "BUYER";

export function normalizeDashboardRole(role?: string): DashboardRole {
  if (role === "VENDOR" || role === "ADMIN" || role === "BUYER") {
    return role;
  }

  return roleFallback;
}

export function getRoleFromDashboardPath(pathname: string): DashboardRole {
  if (pathname.startsWith("/admin")) return "ADMIN";
  if (pathname.startsWith("/seller")) return "VENDOR";
  return "BUYER";
}
