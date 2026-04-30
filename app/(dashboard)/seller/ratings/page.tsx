"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, MessageSquare, Package, Star } from "lucide-react";
import { toast } from "sonner";
import { ProductReviews, RatingStars } from "@/components/shop/ProductReviews";
import { formatCurrency } from "@/lib/seller-products";
import { reviewService, type ProductReview, type ReviewListResult, type ReviewQueryParams } from "@/services/review.service";

const emptyReviewResult: ReviewListResult = {
  summary: {
    averageRating: 0,
    totalReviews: 0,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  },
  reviews: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-NG", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <article className="rounded-[26px] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F6F6F4]">
          {review.product?.image ? (
            <Image src={review.product.image} alt={review.product.name} fill sizes="64px" className="object-contain p-2" />
          ) : (
            <Package className="m-5 h-6 w-6 text-[#B7B7B2]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <p className="truncate text-sm font-black text-[#171714]">{review.product?.name || "Product review"}</p>
              <p className="mt-1 text-xs font-bold text-[#8A8A86]">
                {review.product?.category || "Product"} {review.product?.price ? `- ${formatCurrency(review.product.price)}` : ""}
              </p>
            </div>
            <span className="text-xs font-bold text-[#8A8A86]">{formatDate(review.createdAt)}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RatingStars rating={review.rating} size="h-3.5 w-3.5" />
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
              <BadgeCheck className="h-3 w-3" />
              Verified purchase
            </span>
          </div>

          <h3 className="mt-3 text-sm font-black text-[#171714]">{review.title || "Buyer feedback"}</h3>
          {review.comment ? <p className="mt-2 text-sm font-semibold leading-6 text-[#74746F]">{review.comment}</p> : null}
          <p className="mt-3 text-xs font-black text-[#171714]">By {review.buyerName || "Verified buyer"}</p>
        </div>
      </div>
    </article>
  );
}

export default function SellerRatingsPage() {
  const [result, setResult] = useState<ReviewListResult>(emptyReviewResult);
  const [query, setQuery] = useState<ReviewQueryParams>({ page: 1, limit: 12, rating: "All" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadReviews = async () => {
      setIsLoading(true);

      try {
        const reviews = await reviewService.getSellerReviews(query);
        if (!isActive) return;
        setResult(reviews);
      } catch {
        toast.error("Unable to load seller ratings.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadReviews();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(
    () => [
      { label: "Average rating", value: result.summary.averageRating.toFixed(1), icon: Star },
      { label: "Total reviews", value: result.summary.totalReviews.toString(), icon: MessageSquare },
      { label: "Five star", value: (result.summary.distribution["5"] || 0).toString(), icon: BadgeCheck },
      { label: "Current page", value: result.reviews.length.toString(), icon: Package },
    ],
    [result]
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Seller ratings</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Customer feedback</h1>
            <p className="mt-1 text-sm font-semibold text-[#74746F]">
              Track verified buyer reviews, spot product quality signals, and respond with better fulfillment.
            </p>
          </div>
          <select
            value={query.rating || "All"}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                rating: event.target.value === "All" ? "All" : Number(event.target.value),
                page: 1,
              }))
            }
            className="h-11 rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-xs font-black text-[#171714] outline-none"
          >
            <option value="All">All ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>{rating} stars</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[26px] bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <ProductReviews summary={result.summary} reviews={result.reviews} />

      <section className="space-y-3">
        {isLoading ? (
          <div className="rounded-[26px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">Loading reviews...</div>
        ) : result.reviews.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center rounded-[30px] bg-white p-8 text-center shadow-sm">
            <div>
              <Star className="mx-auto h-10 w-10 text-[#F25A1D]" />
              <h2 className="mt-4 text-2xl font-black text-[#171714]">No seller ratings yet</h2>
              <p className="mt-2 text-sm font-semibold text-[#74746F]">Delivered buyer reviews for your products will appear here.</p>
            </div>
          </div>
        ) : (
          result.reviews.map((review) => <ReviewCard key={review._id} review={review} />)
        )}
      </section>

      <div className="flex items-center justify-between rounded-[26px] bg-white p-4 shadow-sm">
        <button
          type="button"
          disabled={!result.pagination.hasPrevPage}
          onClick={() => setQuery((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#74746F] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>
        <p className="text-xs font-black text-[#8A8A86]">Page {result.pagination.page} of {result.pagination.totalPages}</p>
        <button
          type="button"
          disabled={!result.pagination.hasNextPage}
          onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) + 1 }))}
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black text-[#74746F] disabled:opacity-40"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
