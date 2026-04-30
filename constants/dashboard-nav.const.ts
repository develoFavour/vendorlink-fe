import {
	CircleDollarSign,
	Heart,
	LayoutDashboard,
	MessageSquare,
	Package,
	ShoppingBag,
	ShoppingCart,
	Star,
	Store,
	Users,
} from "lucide-react";
import type { DashboardNavItem } from "@/types/dashboard";

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
	{
		title: "Overview",
		path: "",
		icon: LayoutDashboard,
		roles: ["BUYER", "VENDOR", "ADMIN"],
	},
	{
		title: "Products",
		path: "products",
		icon: Package,
		roles: ["BUYER", "VENDOR", "ADMIN"],
	},
	{
		title: "Cart",
		path: "cart",
		icon: ShoppingCart,
		roles: ["BUYER"],
	},
	{
		title: "Wishlist",
		path: "wishlist",
		icon: Heart,
		roles: ["BUYER"],
	},
	{
		title: "Orders",
		path: "orders",
		icon: ShoppingBag,
		roles: ["BUYER", "VENDOR", "ADMIN"],
	},
	{
		title: "Ratings",
		path: "ratings",
		icon: Star,
		roles: ["VENDOR", "ADMIN"],
	},
	{
		title: "Messages",
		path: "messages",
		icon: MessageSquare,
		roles: ["BUYER", "VENDOR"],
	},
	{
		title: "Earnings",
		path: "earnings",
		icon: CircleDollarSign,
		roles: ["VENDOR", "ADMIN"],
	},
	{
		title: "Vendors",
		path: "vendors",
		icon: Store,
		roles: ["ADMIN"],
	},
	{
		title: "Users",
		path: "users",
		icon: Users,
		roles: ["ADMIN"],
	},
];

export const DASHBOARD_ROLE_ROOTS = {
	BUYER: "/buyer",
	VENDOR: "/seller",
	ADMIN: "/admin",
} as const;
