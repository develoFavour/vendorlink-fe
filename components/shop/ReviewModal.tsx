"use client";

import { useState } from "react";
import { Star, Trash2, X } from "lucide-react";
import type { ProductReview, ReviewPayload } from "@/services/review.service";

type ReviewModalProps = {
  open: boolean;
  existingReview?: ProductReview | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: ReviewPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ReviewModal({
  open,
  existingReview,
  isSubmitting = false,
  onClose,
  onSubmit,
  onDelete,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");

  if (!open) return null;

  const submitReview = async () => {
    await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[30px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Verified review</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#171714]">
              {existingReview ? "Update your review" : "Rate this product"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#74746F]">
              Share useful feedback for other buyers after your delivered purchase.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F6F6F4] text-[#74746F]"
            aria-label="Close review modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#171714]">Your rating</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F6F6F4] text-amber-400 transition-colors hover:bg-[#FFEDE5]"
                  aria-label={`Rate ${value} out of 5`}
                >
                  <Star className={`h-5 w-5 ${value <= rating ? "fill-current" : "text-[#D8D8D4]"}`} />
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-black uppercase tracking-wider text-[#171714]">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="What stood out?"
            className="mt-2 h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F8F8F6] px-4 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] focus:border-[#F25A1D]/50"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-wider text-[#171714]">Comment</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            placeholder="Tell buyers about fit, quality, delivery, or anything useful."
            className="mt-2 min-h-32 w-full resize-none rounded-2xl border border-black/[0.08] bg-[#F8F8F6] p-4 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] focus:border-[#F25A1D]/50"
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {existingReview && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-100 px-4 text-xs font-black text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete review
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={submitReview}
            disabled={isSubmitting}
            className="h-12 rounded-2xl bg-[#F25A1D] px-6 text-sm font-black text-white shadow-sm shadow-[#F25A1D]/20 transition-colors hover:bg-[#de4c12] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : existingReview ? "Update review" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}
