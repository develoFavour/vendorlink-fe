"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";
import { conversationService } from "@/services/conversation.service";
import { reviewService, type ReviewEligibility, type ReviewListResult, type ReviewPayload } from "@/services/review.service";
import { ProductReviews, RatingStars } from "@/components/shop/ProductReviews";
import { ReviewModal } from "@/components/shop/ReviewModal";

const emptyReviewResult: ReviewListResult = {
  summary: {
    averageRating: 0,
    totalReviews: 0,
    distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  },
  reviews: [],
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

export default function BuyerProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewListResult>(emptyReviewResult);
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibility | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProduct = async () => {
      setIsLoading(true);

      try {
        const [productResult, reviews] = await Promise.all([
          productService.getPublicProduct(params.id),
          reviewService.getProductReviews(params.id),
        ]);

        if (!isActive) return;
        setProduct(productResult);
        setSelectedSize(productResult.sizes[0] || "One Size");
        setReviewResult(reviews);
      } catch {
        if (isActive) setProduct(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadProduct();

    return () => {
      isActive = false;
    };
  }, [params.id]);

  useEffect(() => {
    let isActive = true;

    const loadBuyerState = async () => {
      try {
        const [wishlist, eligibility] = await Promise.all([
          wishlistService.getWishlist(),
          reviewService.getEligibility(params.id),
        ]);

        if (!isActive) return;
        setIsWishlisted(wishlist.productIds.includes(params.id));
        setReviewEligibility(eligibility);
      } catch {
        if (!isActive) return;
        setIsWishlisted(false);
        setReviewEligibility(null);
      }
    };

    void loadBuyerState();

    return () => {
      isActive = false;
    };
  }, [params.id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    return product.gallery.length ? product.gallery : [product.image];
  }, [product]);

  if (isLoading) {
    return (
      <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-[#8A8A86] shadow-sm sm:rounded-[28px] sm:p-8">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-[24px] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-8">
        <h1 className="text-2xl font-black text-[#171714]">Product not found</h1>
        <Link href="/buyer/products" className="mt-5 inline-flex rounded-full bg-[#171714] px-5 py-3 text-xs font-black text-white">
          Back to products
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const currentImage = gallery[activeImage] || product.image;

  const toggleWishlist = async () => {
    const nextValue = !isWishlisted;
    setIsWishlisted(nextValue);

    try {
      if (nextValue) {
        await wishlistService.add(product.id);
        toast.success("Saved to wishlist.");
      } else {
        await wishlistService.remove(product.id);
        toast.success("Removed from wishlist.");
      }
    } catch {
      setIsWishlisted(!nextValue);
      toast.error("Unable to update wishlist.");
    }
  };

  const addToCart = async () => {
    try {
      await cartService.addItem(product.id, quantity);
      toast.success("Added to cart.");
    } catch {
      toast.error("Unable to add product to cart.");
    }
  };

  const buyNow = async () => {
    try {
      await cartService.addItem(product.id, quantity);
      router.push("/buyer/checkout");
    } catch {
      toast.error("Unable to start checkout.");
    }
  };

  const startVendorChat = async () => {
    if (!product) return;
    setIsStartingChat(true);

    try {
      const conversation = await conversationService.startFromProduct(product.id);
      router.push(`/buyer/messages?conversation=${conversation._id}`);
    } catch {
      toast.error("Unable to start vendor chat.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const refreshReviews = async () => {
    const [reviews, eligibility] = await Promise.all([
      reviewService.getProductReviews(product.id),
      reviewService.getEligibility(product.id),
    ]);
    setReviewResult(reviews);
    setReviewEligibility(eligibility);
  };

  const submitReview = async (payload: ReviewPayload) => {
    setIsSubmittingReview(true);

    try {
      if (reviewEligibility?.existingReview) {
        await reviewService.updateMyReview(product.id, payload);
        toast.success("Review updated.");
      } else {
        await reviewService.createReview(product.id, payload);
        toast.success("Review submitted.");
      }

      await refreshReviews();
      setIsReviewModalOpen(false);
    } catch {
      toast.error("Unable to save review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const deleteReview = async () => {
    setIsSubmittingReview(true);

    try {
      await reviewService.deleteMyReview(product.id);
      toast.success("Review deleted.");
      await refreshReviews();
      setIsReviewModalOpen(false);
    } catch {
      toast.error("Unable to delete review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const reviewCta = reviewEligibility?.canReview ? (
    <button
      type="button"
      onClick={() => setIsReviewModalOpen(true)}
      className="h-11 rounded-2xl bg-[#171714] px-5 text-xs font-black text-white transition-colors hover:bg-black"
    >
      {reviewEligibility.existingReview ? "Edit your review" : "Write a review"}
    </button>
  ) : (
    <div className="rounded-2xl bg-[#F6F6F4] px-4 py-3 text-xs font-black text-[#8A8A86]">
      {reviewEligibility?.reason || "Delivered purchase required to review"}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link href="/buyer/products" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#8A8A86] hover:text-[#F25A1D]">
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">{product.name}</h1>
        </div>
        <button
          onClick={toggleWishlist}
          className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs font-black transition-colors ${
            isWishlisted ? "bg-[#FFEDE5] text-[#F25A1D]" : "bg-white text-[#74746F] shadow-sm hover:text-[#F25A1D]"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          {isWishlisted ? "Saved" : "Save item"}
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[92px_minmax(0,1fr)]">
            <div className="order-2 grid grid-cols-4 gap-2 lg:order-1 lg:grid-cols-1">
              {gallery.slice(0, 5).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 overflow-hidden rounded-2xl border-2 bg-[#F6F6F4] transition-colors sm:h-20 ${
                    activeImage === index ? "border-[#F25A1D]" : "border-transparent hover:border-black/10"
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="84px" className="object-contain p-2" />
                </button>
              ))}
            </div>

            <div className="relative order-1 min-h-[300px] overflow-hidden rounded-[24px] bg-[#F6F6F4] sm:min-h-[420px] sm:rounded-[28px] lg:order-2">
              {hasDiscount && (
                <span className="absolute left-5 top-5 z-10 rounded-full bg-[#F25A1D] px-3 py-1.5 text-[11px] font-black text-white">
                  {product.discountPercent}% OFF
                </span>
              )}
              <Image src={currentImage} alt={product.name} fill sizes="760px" className="object-contain p-6 sm:p-10" priority />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#FFEDE5] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#F25A1D]">
                {product.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified vendor
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black leading-tight text-[#171714]">{product.name}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#8A8A86]">{product.shortDescription || product.brand}</p>

            <div className="mt-4 flex items-center gap-2">
              <RatingStars rating={reviewResult.summary.averageRating} />
              <span className="text-xs font-black text-[#171714]">{reviewResult.summary.averageRating.toFixed(1)}</span>
              <span className="text-xs font-semibold text-[#8A8A86]">
                {reviewResult.summary.totalReviews} review{reviewResult.summary.totalReviews === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-black text-[#171714]">{formatCurrency(product.price)}</p>
              {hasDiscount && (
                <p className="mt-1 text-sm font-bold text-[#8A8A86]">
                  <span className="line-through">{formatCurrency(product.compareAtPrice!)}</span>
                  <span className="ml-2 text-emerald-600">Save {formatCurrency(product.compareAtPrice! - product.price)}</span>
                </p>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-[#171714]">Variant</p>
                <p className="text-xs font-bold text-[#8A8A86]">Selected: {selectedSize}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes.length ? product.sizes : ["One Size"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-xl border px-4 py-2 text-xs font-black transition-colors ${
                      selectedSize === size ? "border-[#F25A1D] bg-[#FFEDE5] text-[#F25A1D]" : "border-black/[0.08] text-[#74746F] hover:border-[#F25A1D]/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#F6F6F4] p-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="pl-3 text-xs font-black uppercase tracking-wider text-[#74746F]">Quantity</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#171714]">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-7 text-center text-sm font-black text-[#171714]">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#171714]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <button onClick={addToCart} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#F25A1D] text-sm font-black text-white shadow-sm shadow-[#F25A1D]/20 transition-colors hover:bg-[#de4c12]">
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </button>
              <button onClick={buyNow} className="h-12 rounded-2xl bg-[#171714] text-sm font-black text-white transition-colors hover:bg-black">
                Buy now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Secure", icon: ShieldCheck },
              { label: "Delivery", icon: Truck },
              { label: "Returns", icon: RotateCcw },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                  <Icon className="mx-auto h-5 w-5 text-[#F25A1D]" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#74746F]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">Product story</h3>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#74746F]">{product.description || "No details provided."}</p>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">Specifications</h3>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Material", product.specifications.material],
                ["Care", product.specifications.care],
                ["Package", product.specifications.packageDimensions],
                ["First available", product.specifications.dateFirstAvailable],
                ["Weight", product.weight],
                ["SKU", product.sku],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#F6F6F4] p-4">
                  <dt className="text-[11px] font-black uppercase tracking-wider text-[#8A8A86]">{label}</dt>
                  <dd className="mt-1 text-sm font-black text-[#171714]">{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFEDE5] text-[#F25A1D]">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-[#171714]">{product.brand || "VendorLink Store"}</p>
                <p className="text-xs font-semibold text-emerald-600">Online · replies fast</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {["96%", "98%", "4.8"].map((value, index) => (
                <div key={value} className="rounded-2xl bg-[#F6F6F4] p-3">
                  <p className="text-sm font-black text-[#171714]">{value}</p>
                  <p className="mt-1 text-[9px] font-black uppercase text-[#8A8A86]">{["Rating", "Chat", "Score"][index]}</p>
                </div>
              ))}
            </div>
            <button
              onClick={startVendorChat}
              disabled={isStartingChat}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.08] text-xs font-black text-[#171714] hover:bg-[#F6F6F4] disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              {isStartingChat ? "Opening chat..." : "Chat vendor"}
            </button>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#171714]">Delivery note</h3>
            <div className="mt-4 flex gap-3 rounded-2xl bg-[#F6F6F4] p-4">
              <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F25A1D]" />
              <p className="text-sm font-semibold leading-6 text-[#74746F]">{product.deliveryNote || "Delivery options will be confirmed by the vendor after checkout."}</p>
            </div>
          </div>
        </aside>
      </section>

      <ProductReviews summary={reviewResult.summary} reviews={reviewResult.reviews} cta={reviewCta} />

      {isReviewModalOpen ? (
        <ReviewModal
          open={isReviewModalOpen}
          existingReview={reviewEligibility?.existingReview}
          isSubmitting={isSubmittingReview}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={submitReview}
          onDelete={reviewEligibility?.existingReview ? deleteReview : undefined}
        />
      ) : null}
    </div>
  );
}
