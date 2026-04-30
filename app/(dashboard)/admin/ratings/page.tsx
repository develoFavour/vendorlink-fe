"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  MessageSquare,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { RatingStars } from "@/components/shop/ProductReviews";
import { formatCurrency } from "@/lib/seller-products";
import {
  reviewService,
  type ProductReview,
  type ReviewListResult,
  type ReviewQueryParams,
} from "@/services/review.service";

const emptyReviewResult: ReviewListResult = {
  summary: {
    averageRating: 0,
    totalReviews: 0,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  },
  reviews: [],
  pagination: {
    page: 1,
    limit: 20,
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

export default function AdminRatingsPage() {
  const [result, setResult] = useState<ReviewListResult>(emptyReviewResult);
  const [query, setQuery] = useState<ReviewQueryParams>({ page: 1, limit: 20, rating: "All", status: "All", sort: "newest" });
  const [searchDraft, setSearchDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
  const [reviewToHide, setReviewToHide] = useState<ProductReview | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null);
  const [hideReason, setHideReason] = useState("");

  const loadReviews = async (currentQuery = query) => {
    setIsLoading(true);

    try {
      const reviews = await reviewService.getAdminReviews(currentQuery);
      setResult(reviews);
    } catch {
      toast.error("Unable to load review moderation.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const reviews = await reviewService.getAdminReviews(query);
        if (!isActive) return;
        setResult(reviews);
      } catch {
        toast.error("Unable to load review moderation.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [query]);

  const stats = useMemo(() => {
    const hidden = result.reviews.filter((review) => review.moderationStatus === "HIDDEN").length;
    const visible = result.reviews.filter((review) => review.moderationStatus !== "HIDDEN").length;
    const verified = result.reviews.filter((review) => review.isVerifiedPurchase).length;

    return [
      { label: "Matched reviews", value: result.pagination.total.toString(), detail: "All products", icon: MessageSquare },
      { label: "Visible here", value: visible.toString(), detail: "Public rating pool", icon: Eye },
      { label: "Hidden here", value: hidden.toString(), detail: "Moderated reviews", icon: EyeOff },
      { label: "Verified", value: verified.toString(), detail: "Current page", icon: BadgeCheck },
      { label: "Average", value: result.summary.averageRating.toFixed(1), detail: `${result.summary.totalReviews} visible`, icon: Star },
    ];
  }, [result]);

  const applySearch = () => {
    setQuery((current) => ({ ...current, search: searchDraft.trim(), page: 1 }));
  };

  const updateReviewInList = (updatedReview: ProductReview) => {
    setResult((current) => ({
      ...current,
      reviews: current.reviews.map((review) => (review._id === updatedReview._id ? updatedReview : review)),
    }));
  };

  const hideReview = async () => {
    if (!reviewToHide) return;
    setPendingReviewId(reviewToHide._id);

    try {
      const updated = await reviewService.hideReview(reviewToHide._id, hideReason);
      updateReviewInList(updated);
      toast.success("Review hidden from public ratings.");
      setReviewToHide(null);
      setHideReason("");
      await loadReviews();
    } catch {
      toast.error("Unable to hide review.");
    } finally {
      setPendingReviewId(null);
    }
  };

  const restoreReview = async (review: ProductReview) => {
    setPendingReviewId(review._id);

    try {
      const updated = await reviewService.restoreReview(review._id);
      updateReviewInList(updated);
      toast.success("Review restored.");
      await loadReviews();
    } catch {
      toast.error("Unable to restore review.");
    } finally {
      setPendingReviewId(null);
    }
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;
    setPendingReviewId(reviewToDelete._id);

    try {
      await reviewService.deleteReviewAsAdmin(reviewToDelete._id);
      setReviewToDelete(null);
      toast.success("Review deleted.");
      await loadReviews();
    } catch {
      toast.error("Unable to delete review.");
    } finally {
      setPendingReviewId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Admin ratings</p>
        <div className="mt-3 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Review moderation</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#74746F]">
              Manage verified-purchase feedback, hide abusive reviews, restore legitimate comments, and remove spam permanently.
            </p>
          </div>
          <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applySearch();
              }}
              placeholder="Search buyer, product, title, comment"
              className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-80"
            />
            <button
              type="button"
              onClick={applySearch}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm"
              aria-label="Search reviews"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-[26px] bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{stat.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-3 rounded-[30px] bg-white p-4 shadow-sm md:grid-cols-3">
        <select
          value={query.rating || "All"}
          onChange={(event) => setQuery((current) => ({ ...current, rating: event.target.value === "All" ? "All" : Number(event.target.value), page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="All">All ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>{rating} stars</option>
          ))}
        </select>
        <select
          value={query.status || "All"}
          onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as ReviewQueryParams["status"], page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="All">All visibility</option>
          <option value="VISIBLE">Visible</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <select
          value={query.sort || "newest"}
          onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value as ReviewQueryParams["sort"], page: 1 }))}
          className="h-11 rounded-2xl border border-black/[0.06] bg-[#F8F8F6] px-4 text-xs font-black text-[#74746F] outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="rating_high">Highest rating</option>
          <option value="rating_low">Lowest rating</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
        <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Review</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Product</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Buyer</TableHead>
              <TableHead className="py-5 text-xs font-black uppercase tracking-wider text-[#8A8A86]">Visibility</TableHead>
              <TableHead className="pr-5 text-right text-xs font-black uppercase tracking-wider text-[#8A8A86]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-12 text-center text-sm font-black text-[#8A8A86]">
                  Loading review moderation...
                </TableCell>
              </TableRow>
            ) : result.reviews.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="px-6 py-16 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-[#F25A1D]" />
                  <h2 className="mt-4 text-2xl font-black text-[#171714]">No reviews found</h2>
                  <p className="mt-2 text-sm font-semibold text-[#74746F]">Try another rating, visibility, or search filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              result.reviews.map((review) => {
                const isHidden = review.moderationStatus === "HIDDEN";
                const isPending = pendingReviewId === review._id;

                return (
                  <TableRow key={review._id} className="hover:bg-[#FAFAF9]">
                    <TableCell className="px-5 py-4">
                      <RatingStars rating={review.rating} size="h-3.5 w-3.5" />
                      <p className="mt-2 max-w-[360px] truncate text-sm font-black text-[#171714]">{review.title || "Untitled review"}</p>
                      <p className="mt-1 max-w-[420px] truncate text-xs font-semibold text-[#74746F]">{review.comment || "No comment provided"}</p>
                      <p className="mt-2 text-[11px] font-bold text-[#8A8A86]">{formatDate(review.createdAt)}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#F6F6F4]">
                          {review.product?.image ? (
                            <Image src={review.product.image} alt={review.product.name} fill sizes="48px" className="object-contain p-1.5" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          {review.product?._id ? (
                            <Link href={`/products/${review.product._id}`} className="block max-w-[220px] truncate text-sm font-black text-[#171714] hover:text-[#F25A1D]">
                              {review.product.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-black text-[#171714]">Product</p>
                          )}
                          <p className="mt-1 text-xs font-bold text-[#8A8A86]">
                            {review.product?.category || "Category"} {review.product?.price ? `- ${formatCurrency(review.product.price)}` : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-black text-[#171714]">{review.buyerName}</p>
                      {review.isVerifiedPurchase ? (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${isHidden ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {isHidden ? "Hidden" : "Visible"}
                      </span>
                      {review.hiddenReason ? <p className="mt-2 max-w-[180px] truncate text-xs font-bold text-[#8A8A86]">{review.hiddenReason}</p> : null}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-2">
                        {isHidden ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => restoreReview(review)}
                            className="inline-flex h-9 items-center gap-2 rounded-2xl bg-[#171714] px-4 text-xs font-black text-white disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4" />
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => {
                              setReviewToHide(review);
                              setHideReason("");
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-2xl bg-[#FFEDE5] px-4 text-xs font-black text-[#F25A1D] disabled:opacity-50"
                          >
                            <EyeOff className="h-4 w-4" />
                            Hide
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setReviewToDelete(review)}
                          className="grid h-9 w-9 place-items-center rounded-2xl border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>

        {!isLoading && result.reviews.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] p-5 text-sm font-bold text-[#74746F] md:flex-row">
            <span>Page {result.pagination.page} of {result.pagination.totalPages} - {result.pagination.total} matched reviews</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!result.pagination.hasPrevPage}
                onClick={() => setQuery((current) => ({ ...current, page: Math.max((current.page || 1) - 1, 1) }))}
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-black/[0.08] px-4 text-xs font-black disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={!result.pagination.hasNextPage}
                onClick={() => setQuery((current) => ({ ...current, page: (current.page || 1) + 1 }))}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#171714] px-4 text-xs font-black text-white disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <Dialog open={Boolean(reviewToHide)} onOpenChange={(open) => !open && setReviewToHide(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[#171714]">Hide review?</DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              Hidden reviews are removed from public product ratings, but kept for audit and restoration.
            </DialogDescription>
          </DialogHeader>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wider text-[#171714]">Reason</span>
            <textarea
              value={hideReason}
              onChange={(event) => setHideReason(event.target.value)}
              placeholder="Spam, abusive language, irrelevant content..."
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] p-4 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2]"
            />
          </label>
          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-black/[0.06] bg-[#FAFAF9] p-4">
            <DialogClose className="h-11 rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F]">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={!reviewToHide || pendingReviewId === reviewToHide._id}
              onClick={hideReview}
              className="h-11 rounded-2xl bg-[#171714] px-5 text-xs font-black text-white disabled:opacity-50"
            >
              Hide review
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reviewToDelete)} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="rounded-[28px] bg-white p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight text-[#171714]">Delete review?</DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-6 text-[#74746F]">
              This permanently removes the review. Use hide if you may need to restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 mt-2 border-t border-black/[0.06] bg-[#FAFAF9] p-4">
            <DialogClose className="h-11 rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F]">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={!reviewToDelete || pendingReviewId === reviewToDelete._id}
              onClick={deleteReview}
              className="h-11 rounded-2xl bg-red-600 px-5 text-xs font-black text-white disabled:opacity-50"
            >
              Delete review
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
