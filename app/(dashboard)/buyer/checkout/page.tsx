"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	Banknote,
	CreditCard,
	MapPin,
	PackageCheck,
	Truck,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/seller-products";
import { cartService, type CartResult } from "@/services/cart.service";
import {
	orderService,
	type DeliveryAddress,
	type PaymentMethod,
} from "@/services/order.service";

const paymentOptions: {
	label: PaymentMethod;
	description: string;
	icon: typeof Banknote;
}[] = [
	{
		label: "Paystack",
		description: "Pay securely online by card, transfer, or USSD.",
		icon: CreditCard,
	},
	{
		label: "Cash on Delivery",
		description: "Pay when your order arrives.",
		icon: Banknote,
	},
];

const getDeliveryFee = (subtotal: number) =>
	subtotal >= 100000 || subtotal === 0 ? 0 : 2500;

const initialAddress: DeliveryAddress = {
	fullName: "",
	phone: "",
	address: "",
	city: "",
	state: "",
	note: "",
};

export default function BuyerCheckoutPage() {
	const router = useRouter();
	const [cart, setCart] = useState<CartResult>({
		items: [],
		count: 0,
		subtotal: 0,
	});
	const [address, setAddress] = useState<DeliveryAddress>(initialAddress);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Paystack");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		cartService
			.getCart()
			.then(setCart)
			.catch(() => toast.error("Unable to load checkout."))
			.finally(() => setIsLoading(false));
	}, []);

	const deliveryFee = useMemo(
		() => getDeliveryFee(cart.subtotal),
		[cart.subtotal],
	);
	const total = cart.subtotal + deliveryFee;

	const updateAddress = (key: keyof DeliveryAddress, value: string) => {
		setAddress((current) => ({ ...current, [key]: value }));
	};

	const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (cart.items.length === 0) {
			toast.error("Your cart is empty.");
			return;
		}

		const requiredFields: (keyof DeliveryAddress)[] = [
			"fullName",
			"phone",
			"address",
			"city",
			"state",
		];
		const missingField = requiredFields.find(
			(field) => !address[field]?.trim(),
		);

		if (missingField) {
			toast.error("Please complete your delivery information.");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await orderService.checkout({
				deliveryAddress: address,
				paymentMethod,
			});

			if (result.payment?.authorizationUrl) {
				toast.success("Redirecting to Paystack.");
				window.location.href = result.payment.authorizationUrl;
				return;
			}

			toast.success("Order placed successfully.");
			router.replace(`/buyer/orders?placed=${result.order._id}`);
		} catch {
			toast.error("Unable to place this order.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
				Preparing checkout...
			</div>
		);
	}

	if (cart.items.length === 0) {
		return (
			<section className="grid min-h-[70vh] place-items-center rounded-[32px] bg-white p-8 text-center shadow-sm">
				<div className="max-w-md">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFEDE5] text-[#F25A1D]">
						<PackageCheck className="h-7 w-7" />
					</div>
					<h1 className="mt-5 text-3xl font-black tracking-tight text-[#171714]">
						Nothing to checkout
					</h1>
					<p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">
						Add products to your cart before starting checkout.
					</p>
					<Link
						href="/buyer/products"
						className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#171714] px-6 text-sm font-black text-white"
					>
						Browse products
					</Link>
				</div>
			</section>
		);
	}

	return (
		<form
			onSubmit={submitOrder}
			className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
		>
			<section className="space-y-5">
				<div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
					<Link
						href="/buyer/cart"
						className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#8A8A86] hover:text-[#F25A1D]"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to cart
					</Link>
					<h1 className="mt-3 text-3xl font-black tracking-tight text-[#171714]">
						Checkout
					</h1>
					<p className="mt-1 text-sm font-semibold text-[#74746F]">
						Confirm delivery details and choose how you want to pay.
					</p>
				</div>

				<div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
					<div className="flex items-center gap-3">
						<div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFEDE5] text-[#F25A1D]">
							<MapPin className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-lg font-black text-[#171714]">
								Delivery information
							</h2>
							<p className="text-xs font-semibold text-[#74746F]">
								Used by vendors to confirm dispatch.
							</p>
						</div>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						{[
							{ key: "fullName", label: "Full name", placeholder: "Jane Doe" },
							{
								key: "phone",
								label: "Phone number",
								placeholder: "08012345678",
							},
							{ key: "city", label: "City", placeholder: "Lagos" },
							{ key: "state", label: "State", placeholder: "Lagos" },
						].map((field) => (
							<label key={field.key} className="block">
								<span className="text-xs font-black uppercase tracking-wider text-[#74746F]">
									{field.label}
								</span>
								<input
									value={address[field.key as keyof DeliveryAddress] || ""}
									onChange={(event) =>
										updateAddress(
											field.key as keyof DeliveryAddress,
											event.target.value,
										)
									}
									placeholder={field.placeholder}
									className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-sm font-bold text-[#171714] outline-none transition-colors placeholder:text-[#B7B7B2] focus:border-[#F25A1D]"
								/>
							</label>
						))}
						<label className="block sm:col-span-2">
							<span className="text-xs font-black uppercase tracking-wider text-[#74746F]">
								Street address
							</span>
							<input
								value={address.address}
								onChange={(event) =>
									updateAddress("address", event.target.value)
								}
								placeholder="House number, street, area"
								className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-sm font-bold text-[#171714] outline-none transition-colors placeholder:text-[#B7B7B2] focus:border-[#F25A1D]"
							/>
						</label>
						<label className="block sm:col-span-2">
							<span className="text-xs font-black uppercase tracking-wider text-[#74746F]">
								Delivery note
							</span>
							<textarea
								value={address.note}
								onChange={(event) => updateAddress("note", event.target.value)}
								placeholder="Gate code, landmark, pickup preference"
								rows={4}
								className="mt-2 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 py-3 text-sm font-bold text-[#171714] outline-none transition-colors placeholder:text-[#B7B7B2] focus:border-[#F25A1D]"
							/>
						</label>
					</div>
				</div>

				<div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
					<div className="flex items-center gap-3">
						<div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#171714] text-white">
							<Banknote className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-lg font-black text-[#171714]">
								Payment method
							</h2>
							<p className="text-xs font-semibold text-[#74746F]">
								Pay online with Paystack or pay the vendor when your order arrives.
							</p>
						</div>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-2">
						{paymentOptions.map((option) => {
							const Icon = option.icon;
							const isSelected = paymentMethod === option.label;

							return (
								<button
									key={option.label}
									type="button"
									onClick={() => setPaymentMethod(option.label)}
									className={`rounded-3xl border p-4 text-left transition-colors ${
										isSelected
											? "border-[#F25A1D] bg-[#FFEDE5]"
											: "border-black/[0.08] bg-[#F8F8F6] hover:border-[#F25A1D]/40"
									}`}
								>
									<Icon
										className={`h-5 w-5 ${isSelected ? "text-[#F25A1D]" : "text-[#74746F]"}`}
									/>
									<p className="mt-4 text-sm font-black text-[#171714]">
										{option.label}
									</p>
									<p className="mt-1 text-xs font-semibold leading-5 text-[#74746F]">
										{option.description}
									</p>
								</button>
							);
						})}
					</div>
				</div>
			</section>

			<aside className="h-fit rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6 xl:sticky xl:top-5">
				<div className="flex items-center gap-3">
					<div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFEDE5] text-[#F25A1D]">
						<Truck className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-black text-[#171714]">Order summary</h2>
						<p className="text-xs font-semibold text-[#74746F]">
							{cart.count} item(s)
						</p>
					</div>
				</div>

				<div className="mt-5 max-h-[320px] space-y-3 overflow-y-auto pr-1">
					{cart.items.map((item) => (
						<div
							key={item.product.id}
							className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-3xl bg-[#F8F8F6] p-3"
						>
							<div className="relative h-14 overflow-hidden rounded-2xl bg-white">
								{item.product.image ? (
									<Image
										src={item.product.image}
										alt={item.product.name}
										fill
										sizes="58px"
										className="object-contain p-2"
									/>
								) : (
									<div className="grid h-full place-items-center text-[9px] font-black uppercase text-[#8A8A86]">
										Image
									</div>
								)}
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-black text-[#171714]">
									{item.product.name}
								</p>
								<p className="mt-1 text-xs font-bold text-[#74746F]">
									Qty {item.quantity}
								</p>
								<p className="mt-1 text-sm font-black text-[#F25A1D]">
									{formatCurrency(item.lineTotal)}
								</p>
							</div>
						</div>
					))}
				</div>

				<div className="mt-6 space-y-4 text-sm font-bold">
					<div className="flex justify-between text-[#74746F]">
						<span>Subtotal</span>
						<span className="text-[#171714]">
							{formatCurrency(cart.subtotal)}
						</span>
					</div>
					<div className="flex justify-between text-[#74746F]">
						<span>Delivery</span>
						<span className="text-[#171714]">
							{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
						</span>
					</div>
					<div className="border-t border-black/[0.08] pt-4">
						<div className="flex justify-between text-base font-black text-[#171714]">
							<span>Total</span>
							<span>{formatCurrency(total)}</span>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="mt-6 flex h-12 w-full items-center justify-center rounded-2xl bg-[#F25A1D] text-sm font-black text-white shadow-sm shadow-[#F25A1D]/20 transition-colors hover:bg-[#de4c12] disabled:opacity-60"
				>
					{isSubmitting ? "Placing order..." : "Place order"}
				</button>
			</aside>
		</form>
	);
}
