"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	ArrowRight,
	Clock3,
	CreditCard,
	Eye,
	PackageCheck,
	Search,
	ShoppingBag,
	Truck,
} from "lucide-react";
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
	orderService,
	type BuyerOrder,
	type OrderStatus,
	type PaymentMethod,
	type PaymentStatus,
	type SellerOrderQueryParams,
} from "@/services/order.service";

const DEFAULT_PAGINATION = {
	page: 1,
	limit: 20,
	total: 0,
	totalPages: 1,
	hasNextPage: false,
	hasPrevPage: false,
};

const statuses: (OrderStatus | "All")[] = [
	"All",
	"Pending",
	"Processing",
	"Ready",
	"In Transit",
	"Delivered",
	"Cancelled",
];
const paymentStatuses: (PaymentStatus | "All")[] = [
	"All",
	"Pending",
	"Paid",
	"Failed",
];
const paymentMethods: (PaymentMethod | "All")[] = [
	"All",
	"Cash on Delivery",
	"Paystack",
];
// const paymentMethods: (PaymentMethod | "All")[] = ["All", "Cash on Delivery", "Bank Transfer", "Mobile Money", "Paystack"];

const statusStyles: Record<OrderStatus, string> = {
	Pending: "bg-amber-50 text-amber-700",
	Processing: "bg-blue-50 text-blue-700",
	Ready: "bg-indigo-50 text-indigo-700",
	"In Transit": "bg-purple-50 text-purple-700",
	Delivered: "bg-emerald-50 text-emerald-700",
	Cancelled: "bg-red-50 text-red-700",
};

const paymentStyles: Record<PaymentStatus, string> = {
	Pending: "bg-amber-50 text-amber-700",
	Paid: "bg-emerald-50 text-emerald-700",
	Failed: "bg-red-50 text-red-700",
};

const formatDate = (date: string) =>
	new Date(date).toLocaleDateString("en-NG", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<BuyerOrder[]>([]);
	const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
	const [query, setQuery] = useState<SellerOrderQueryParams>({
		page: 1,
		limit: 20,
		status: "All",
		paymentStatus: "All",
		paymentMethod: "All",
		sort: "newest",
	});
	const [searchDraft, setSearchDraft] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);

	useEffect(() => {
		let isActive = true;

		const loadOrders = async () => {
			setIsLoading(true);

			try {
				const result = await orderService.getAdminOrders(query);
				if (!isActive) return;
				setOrders(result.orders);
				setPagination(result.pagination);
			} catch {
				toast.error("Unable to load admin orders.");
			} finally {
				if (isActive) setIsLoading(false);
			}
		};

		void loadOrders();

		return () => {
			isActive = false;
		};
	}, [query]);

	const stats = useMemo(() => {
		const paidRevenue = orders
			.filter((order) => order.paymentStatus === "Paid")
			.reduce((total, order) => total + order.total, 0);
		const activeOrders = orders.filter((order) =>
			["Pending", "Processing", "Ready", "In Transit"].includes(order.status),
		).length;
		const multiSellerOrders = orders.filter(
			(order) => order.fulfillments.length > 1,
		).length;

		return [
			{
				label: "Current page",
				value: orders.length.toString(),
				detail: `${pagination.total} total matched`,
				icon: ShoppingBag,
			},
			{
				label: "Paid revenue",
				value: formatCurrency(paidRevenue),
				detail: "Current page",
				icon: CreditCard,
			},
			{
				label: "Active orders",
				value: activeOrders.toString(),
				detail: "Needs fulfillment",
				icon: Truck,
			},
			{
				label: "Multi-seller",
				value: multiSellerOrders.toString(),
				detail: "Split fulfillments",
				icon: PackageCheck,
			},
		];
	}, [orders, pagination.total]);

	const applySearch = () => {
		setQuery((current) => ({
			...current,
			search: searchDraft.trim(),
			page: 1,
		}));
	};

	return (
		<div className="space-y-5">
			<section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
				<p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">
					Admin orders
				</p>
				<div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
					<div>
						<h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">
							Order management
						</h1>
						<p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
							Monitor every marketplace order, payment state, buyer delivery
							details, and multi-vendor fulfillment progress.
						</p>
					</div>
					<div className="flex rounded-2xl bg-[#F6F6F4] p-1">
						<input
							value={searchDraft}
							onChange={(event) => setSearchDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") applySearch();
							}}
							placeholder="Search order, buyer, city, product"
							className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-80"
						/>
						<button
							type="button"
							onClick={applySearch}
							className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm"
							aria-label="Search orders"
						>
							<Search className="h-4 w-4" />
						</button>
					</div>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className="rounded-[26px] bg-white p-5 shadow-sm"
						>
							<Icon className="h-5 w-5 text-[#F25A1D]" />
							<p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								{stat.label}
							</p>
							<p className="mt-2 text-2xl font-black text-[#171714]">
								{stat.value}
							</p>
							<p className="mt-1 text-xs font-bold text-[#74746F]">
								{stat.detail}
							</p>
						</div>
					);
				})}
			</section>

			<section className="grid gap-3 rounded-[30px] bg-white p-4 shadow-sm md:grid-cols-4">
				<select
					value={query.status || "All"}
					onChange={(event) =>
						setQuery((current) => ({
							...current,
							status: event.target.value as OrderStatus | "All",
							page: 1,
						}))
					}
					className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
				>
					{statuses.map((status) => (
						<option key={status} value={status}>
							{status} status
						</option>
					))}
				</select>
				<select
					value={query.paymentStatus || "All"}
					onChange={(event) =>
						setQuery((current) => ({
							...current,
							paymentStatus: event.target.value as PaymentStatus | "All",
							page: 1,
						}))
					}
					className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
				>
					{paymentStatuses.map((status) => (
						<option key={status} value={status}>
							{status} payment
						</option>
					))}
				</select>
				<select
					value={query.paymentMethod || "All"}
					onChange={(event) =>
						setQuery((current) => ({
							...current,
							paymentMethod: event.target.value as PaymentMethod | "All",
							page: 1,
						}))
					}
					className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
				>
					{paymentMethods.map((method) => (
						<option key={method} value={method}>
							{method}
						</option>
					))}
				</select>
				<select
					value={query.sort || "newest"}
					onChange={(event) =>
						setQuery((current) => ({
							...current,
							sort: event.target.value as SellerOrderQueryParams["sort"],
							page: 1,
						}))
					}
					className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
				>
					<option value="newest">Newest first</option>
					<option value="oldest">Oldest first</option>
					<option value="total_desc">Highest total</option>
					<option value="total_asc">Lowest total</option>
				</select>
			</section>

			<section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
				<div className="overflow-x-auto">
				<Table className="min-w-[980px]">
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Order
							</TableHead>
							<TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Buyer
							</TableHead>
							<TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Items
							</TableHead>
							<TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Payment
							</TableHead>
							<TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Status
							</TableHead>
							<TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">
								Total
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow className="hover:bg-transparent">
								<TableCell
									colSpan={6}
									className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]"
								>
									Loading orders...
								</TableCell>
							</TableRow>
						) : orders.length === 0 ? (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={6} className="px-6 py-16 text-center">
									<ShoppingBag className="mx-auto h-10 w-10 text-[#F25A1D]" />
									<h2 className="mt-4 text-2xl font-black text-[#171714]">
										No orders found
									</h2>
									<p className="mt-2 text-sm font-semibold text-[#74746F]">
										Adjust your filters or search terms to find matching orders.
									</p>
								</TableCell>
							</TableRow>
						) : (
							orders.map((order) => {
								const firstItem = order.items[0];
								const itemCount = order.items.reduce(
									(total, item) => total + item.quantity,
									0,
								);

								return (
									<TableRow key={order._id} className="hover:bg-[#FAFAF9]">
										<TableCell className="px-5 py-4">
											<button
												type="button"
												onClick={() => setSelectedOrder(order)}
												className="text-left text-sm font-black text-[#171714] hover:text-[#F25A1D]"
											>
												{order.orderNumber}
											</button>
											<p className="mt-1 text-xs font-bold text-[#8A8A86]">
												{formatDate(order.createdAt)}
											</p>
										</TableCell>
										<TableCell className="py-4">
											<p className="text-sm font-black text-[#171714]">
												{order.deliveryAddress.fullName}
											</p>
											<p className="mt-1 text-xs font-bold text-[#8A8A86]">
												{order.deliveryAddress.city},{" "}
												{order.deliveryAddress.state}
											</p>
										</TableCell>
										<TableCell className="py-4">
											<div className="flex items-center gap-3">
												<div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#F6F6F4]">
													{firstItem?.image ? (
														<Image
															src={firstItem.image}
															alt={firstItem.name}
															fill
															sizes="48px"
															className="object-contain p-1.5"
														/>
													) : null}
												</div>
												<div className="min-w-0">
													<p className="max-w-[220px] truncate text-sm font-black text-[#171714]">
														{firstItem?.name || "Order item"}
													</p>
													<p className="mt-1 text-xs font-bold text-[#74746F]">
														{itemCount} item(s),{" "}
														{order.fulfillments.length || 1} fulfillment(s)
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell className="py-4">
											<span
												className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${paymentStyles[order.paymentStatus]}`}
											>
												{order.paymentStatus}
											</span>
											<p className="mt-2 text-xs font-bold text-[#74746F]">
												{order.paymentMethod}
											</p>
										</TableCell>
										<TableCell className="py-4">
											<span
												className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[order.status]}`}
											>
												{order.status}
											</span>
										</TableCell>
										<TableCell className="pr-5 text-right">
											<p className="text-sm font-black text-[#171714]">
												{formatCurrency(order.total)}
											</p>
											<button
												type="button"
												onClick={() => setSelectedOrder(order)}
												className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#F25A1D]"
											>
												<Eye className="h-3.5 w-3.5" />
												Details
											</button>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
				</div>

				{!isLoading && orders.length > 0 ? (
					<div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-5 text-sm font-bold text-[#74746F] md:flex-row">
						<span>
							Page {pagination.page} of {pagination.totalPages} -{" "}
							{pagination.total} matched orders
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={!pagination.hasPrevPage}
								onClick={() =>
									setQuery((current) => ({
										...current,
										page: Math.max((current.page || 1) - 1, 1),
									}))
								}
								className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black disabled:opacity-40"
							>
								<ArrowLeft className="h-4 w-4" />
								Previous
							</button>
							<button
								type="button"
								disabled={!pagination.hasNextPage}
								onClick={() =>
									setQuery((current) => ({
										...current,
										page: (current.page || 1) + 1,
									}))
								}
								className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#171714] px-4 text-xs font-black text-white disabled:opacity-40"
							>
								Next
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				) : null}
			</section>

			<Dialog
				open={Boolean(selectedOrder)}
				onOpenChange={(open) => !open && setSelectedOrder(null)}
			>
				<DialogContent className="max-h-[88vh] overflow-y-auto rounded-[28px] bg-white p-6 sm:max-w-3xl">
					<DialogHeader>
						<DialogTitle className="text-2xl font-black tracking-tight text-[#171714]">
							{selectedOrder?.orderNumber || "Order details"}
						</DialogTitle>
						<DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
							Buyer delivery, payment, item, and vendor fulfillment breakdown.
						</DialogDescription>
					</DialogHeader>

					{selectedOrder ? (
						<div className="space-y-5">
							<div className="grid gap-3 md:grid-cols-3">
								{[
									{
										label: "Order total",
										value: formatCurrency(selectedOrder.total),
										icon: CreditCard,
									},
									{
										label: "Delivery fee",
										value: formatCurrency(selectedOrder.deliveryFee),
										icon: Truck,
									},
									{
										label: "Date",
										value: formatDate(selectedOrder.createdAt),
										icon: Clock3,
									},
								].map((stat) => {
									const Icon = stat.icon;
									return (
										<div
											key={stat.label}
											className="rounded-2xl bg-[#F6F6F4] p-4"
										>
											<Icon className="h-4 w-4 text-[#F25A1D]" />
											<p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#8A8A86]">
												{stat.label}
											</p>
											<p className="mt-1 text-sm font-black text-[#171714]">
												{stat.value}
											</p>
										</div>
									);
								})}
							</div>

							<div className="grid gap-4 lg:grid-cols-2">
								<div className="rounded-2xl border border-black/[0.06] p-4">
									<h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">
										Buyer delivery
									</h3>
									<p className="mt-3 text-sm font-black text-[#171714]">
										{selectedOrder.deliveryAddress.fullName}
									</p>
									<p className="mt-1 text-sm font-semibold leading-6 text-[#74746F]">
										{selectedOrder.deliveryAddress.address},{" "}
										{selectedOrder.deliveryAddress.city},{" "}
										{selectedOrder.deliveryAddress.state}
									</p>
									<p className="mt-2 text-xs font-bold text-[#8A8A86]">
										{selectedOrder.deliveryAddress.phone}
									</p>
								</div>
								<div className="rounded-2xl border border-black/[0.06] p-4">
									<h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">
										Payment
									</h3>
									<div className="mt-3 flex flex-wrap gap-2">
										<span
											className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${paymentStyles[selectedOrder.paymentStatus]}`}
										>
											{selectedOrder.paymentStatus}
										</span>
										<span className="rounded-full bg-[#F6F6F4] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#74746F]">
											{selectedOrder.paymentMethod}
										</span>
									</div>
									<p className="mt-3 text-xs font-bold text-[#8A8A86]">
										{selectedOrder.paymentReference || "No payment reference"}
									</p>
								</div>
							</div>

							<div className="rounded-2xl border border-black/[0.06] p-4">
								<h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">
									Fulfillments
								</h3>
								<div className="mt-4 space-y-3">
									{(selectedOrder.fulfillments.length
										? selectedOrder.fulfillments
										: [
												{
													vendorId: "Legacy",
													items: selectedOrder.items,
													subtotal: selectedOrder.subtotal,
													status: selectedOrder.status,
													statusHistory: [],
												},
											]
									).map((fulfillment, index) => (
										<div
											key={`${fulfillment.vendorId}-${index}`}
											className="rounded-2xl bg-[#F6F6F4] p-4"
										>
											<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
												<div>
													<p className="text-sm font-black text-[#171714]">
														Vendor fulfillment {index + 1}
													</p>
													<p className="mt-1 text-xs font-bold text-[#8A8A86]">
														{fulfillment.items.length} product line(s)
													</p>
												</div>
												<span
													className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[fulfillment.status]}`}
												>
													{fulfillment.status}
												</span>
											</div>
											<div className="mt-3 space-y-2">
												{fulfillment.items.map((item) => (
													<div
														key={`${item.productId}-${item.name}`}
														className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
													>
														<div className="flex min-w-0 items-center gap-3">
															<div className="relative h-10 w-10 overflow-hidden rounded-xl bg-[#F6F6F4]">
																{item.image ? (
																	<Image
																		src={item.image}
																		alt={item.name}
																		fill
																		sizes="40px"
																		className="object-contain p-1"
																	/>
																) : null}
															</div>
															<div className="min-w-0">
																<p className="truncate text-sm font-black text-[#171714]">
																	{item.name}
																</p>
																<p className="text-xs font-bold text-[#8A8A86]">
																	Qty {item.quantity}
																</p>
															</div>
														</div>
														<p className="text-sm font-black text-[#171714]">
															{formatCurrency(item.lineTotal)}
														</p>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}
