"use client";

import { Star, BadgeCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { ProductReview, ReviewSummary } from "@/services/review.service";

type ProductReviewsProps = {
	summary: ReviewSummary;
	reviews: ProductReview[];
	cta?: ReactNode;
};

const formatDate = (date: string) =>
	new Date(date).toLocaleDateString("en-NG", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});

export function RatingStars({
	rating,
	size = "h-4 w-4",
}: {
	rating: number;
	size?: string;
}) {
	return (
		<div className="flex text-amber-400">
			{Array.from({ length: 5 }).map((_, index) => (
				<Star
					key={index}
					className={`${size} ${index < Math.round(rating) ? "fill-current" : "text-[#D8D8D4]"}`}
				/>
			))}
		</div>
	);
}

export function ProductReviews({ summary, reviews, cta }: ProductReviewsProps) {
	const totalReviews = summary.totalReviews || 0;
	const averageRating = summary.averageRating || 0;

	return (
		<section className="overflow-hidden rounded-[28px] bg-white p-6 shadow-sm">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
				<div>
					<p className="text-sm font-black uppercase tracking-wider text-[#171714]">
						Ratings and reviews
					</p>
					<div className="mt-3 flex items-center gap-3">
						<p className="text-4xl font-black tracking-tight text-[#171714]">
							{averageRating.toFixed(1)}
						</p>
						<div>
							<RatingStars rating={averageRating} />
							<p className="mt-1 text-xs font-bold text-[#8A8A86]">
								{totalReviews} verified review{totalReviews === 1 ? "" : "s"}
							</p>
						</div>
					</div>
				</div>
				{cta}
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
				<div className="space-y-2 lg:sticky lg:top-4 lg:self-start">
					{[5, 4, 3, 2, 1].map((rating) => {
						const count = summary.distribution[String(rating)] || 0;
						const width = totalReviews
							? Math.round((count / totalReviews) * 100)
							: 0;

						return (
							<div
								key={rating}
								className="grid grid-cols-[26px_1fr_28px] items-center gap-2 text-xs font-black text-[#74746F]"
							>
								<span>{rating}</span>
								<div className="h-2 overflow-hidden rounded-full bg-[#F1F1EE]">
									<div
										className="h-full rounded-full bg-[#F25A1D]"
										style={{ width: `${width}%` }}
									/>
								</div>
								<span className="text-right">{count}</span>
							</div>
						);
					})}
				</div>

				<div className="min-w-0">
					<div className="mb-3 flex items-center justify-between gap-3">
						<p className="text-xs font-black uppercase tracking-wider text-[#8A8A86]">
							Recent feedback
						</p>
						{reviews.length > 0 ? (
							<p className="text-[11px] font-bold text-[#B0B0AA]">
								Showing {reviews.length} of {totalReviews}
							</p>
						) : null}
					</div>

					<div className="max-h-[460px] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#D8D8D4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D8D8D4] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
					{reviews.length === 0 ? (
						<div className="rounded-2xl bg-[#F6F6F4] p-5">
							<p className="text-sm font-black text-[#171714]">
								No reviews yet
							</p>
							<p className="mt-1 text-xs font-semibold text-[#74746F]">
								Verified buyer feedback will appear here after delivery.
							</p>
						</div>
					) : (
						reviews.map((review) => (
							<article
								key={review._id}
								className="rounded-2xl border border-black/[0.06] bg-white p-4 transition-colors hover:border-[#F25A1D]/20 hover:bg-[#FFFCFA]"
							>
								<div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
									<div>
										<div className="flex items-center gap-2">
											<RatingStars rating={review.rating} size="h-3.5 w-3.5" />
											{review.isVerifiedPurchase && (
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
													<BadgeCheck className="h-3 w-3" />
													Verified
												</span>
											)}
										</div>
										<h3 className="mt-3 text-sm font-black text-[#171714]">
											{review.title || ""}
										</h3>
									</div>
									<p className="text-xs font-bold text-[#8A8A86]">
										{formatDate(review.createdAt)}
									</p>
								</div>
								{review.comment ? (
									<p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">
										{review.comment}
									</p>
								) : null}
								<p className="mt-3 text-xs font-black text-[#171714]">
									{review.buyerName || "Verified buyer"}
								</p>
							</article>
						))
					)}
					</div>
				</div>
			</div>
		</section>
	);
}
