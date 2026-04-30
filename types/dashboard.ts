import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/services/auth.service";

export type DashboardRole = UserRole;

export type DashboardNavItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: DashboardRole[];
};

export type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};
