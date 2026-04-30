"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, ShoppingCart, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { PublicAuthPrompt } from "@/components/shop/PublicAuthPrompt";
import { ProductReviews, RatingStars } from "@/components/shop/ProductReviews";
import { publicShoppingStorage } from "@/lib/public-shopping";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";
import { reviewService, type ReviewListResult } from "@/services/review.service";

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

export default function PublicProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewResult, setReviewResult] = useState<ReviewListResult>(emptyReviewResult);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addedStylingLook, setAddedStylingLook] = useState<Set<string>>(new Set());
  const [authPrompt, setAuthPrompt] = useState<"cart" | "wishlist" | null>(null);

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
        setReviewResult(reviews);
        if (productResult.sizes.length) {
          setSelectedSize(productResult.sizes[0]);
        }
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-6 sm:pb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#C4553A] border-t-transparent" />
          <p className="text-xs font-black uppercase tracking-wider text-[#111]/45">Curating Details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-6 sm:pb-6">
        <div className="w-full max-w-md rounded-[24px] border border-black/[0.04] bg-white p-6 text-center shadow-md sm:rounded-[28px] sm:p-10">
          <h1 className="text-2xl font-[900] tracking-tight text-[#111]">Product Not Found</h1>
          <p className="mt-2 text-xs font-bold leading-relaxed text-[#111]/50">The item you are looking for may have been removed or is currently unavailable.</p>
          <Link href="/products" className="mt-6 inline-flex rounded-full bg-[#111] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#C4553A]">
            Back to Catalog
          </Link>
        </div>
      </main>
    );
  }

  const gallery = product.gallery.length ? product.gallery : [product.image];
  const activeImage = gallery[activeImageIndex] || product.image;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const toggleStylingLook = (itemName: string) => {
    const next = new Set(addedStylingLook);
    if (next.has(itemName)) {
      next.delete(itemName);
      toast.success(`Removed ${itemName} from your look`);
    } else {
      next.add(itemName);
      toast.success(`Added ${itemName} to your look`);
    }
    setAddedStylingLook(next);
  };

  const addToPublicCart = () => {
    publicShoppingStorage.addToCart(product.id, 1);
    toast.success("Added to public cart.");
    setAuthPrompt("cart");
  };

  const togglePublicWishlist = () => {
    const result = publicShoppingStorage.toggleWishlist(product.id);
    toast.success(result.isSaved ? "Saved locally. Sign in to keep it." : "Removed from local wishlist.");
    if (result.isSaved) setAuthPrompt("wishlist");
  };

  return (
    <>
    <main className="min-h-screen bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-5">
      {/* Main Showcase Canvas */}
      <section className="grid gap-5 rounded-[24px] border border-black/[0.04] bg-white p-4 shadow-sm sm:gap-6 sm:rounded-[28px] sm:p-6 xl:grid-cols-12">
        {/* Left Side: Editorial Image Gallery */}
        <div className="xl:col-span-7 grid gap-4 lg:grid-cols-[100px_1fr]">
          {/* Thumbnails Sidebar */}
          <div className="order-2 flex gap-2 overflow-x-auto py-1 sm:gap-3 lg:order-1 lg:flex-col lg:overflow-visible">
            {gallery.slice(0, 5).map((image, index) => {
              const isActive = activeImageIndex === index;
              return (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveImageIndex(index)}
                  key={`${image}-${index}`}
                  className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 bg-[#FAF9F5]/70 p-1 transition-all duration-300 sm:h-20 sm:w-20 ${
                    isActive
                      ? "border-[#C4553A] shadow-md shadow-[#C4553A]/10 scale-95"
                      : "border-transparent hover:border-black/[0.08]"
                  }`}
                >
                  <Image src={image} alt={`${product.name} thumbnail ${index + 1}`} fill sizes="80px" className="object-contain p-2" />
                </motion.button>
              );
            })}
          </div>

          {/* Active Canvas Frame */}
          <div className="group relative order-1 flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-black/[0.01] bg-[#FAF9F5]/50 shadow-inner sm:min-h-[420px] md:min-h-[520px] lg:order-2">
            {hasDiscount && (
              <span className="absolute left-6 top-6 z-10 rounded-xl bg-[#C4553A] px-3.5 py-1.5 text-xs font-black tracking-wider text-white shadow-md shadow-[#C4553A]/15">
                -{product.discountPercent}% OFF
              </span>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="relative flex min-h-[300px] h-full w-full items-center justify-center sm:min-h-[420px] md:min-h-[520px]"
              >
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="800px"
                  className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105 sm:p-10"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Copywriting & Purchasing Details */}
        <aside className="flex flex-col justify-between p-0 sm:p-2 xl:col-span-5">
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-[#C4553A]/5 border border-[#C4553A]/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#C4553A]">
                {product.category}
              </span>
              <h1 className="mt-3 text-2xl font-[900] tracking-tight leading-snug text-[#111] sm:text-3xl">{product.name}</h1>
              {product.brand && (
                <p className="mt-1 text-xs font-black text-[#111]/45 tracking-wider uppercase">BY {product.brand}</p>
              )}
              
              {/* Rating stars row */}
              <div className="mt-3 flex items-center gap-2">
                <RatingStars rating={reviewResult.summary.averageRating} />
                <span className="text-xs font-bold text-[#111]/50 tracking-wide">
                  {reviewResult.summary.averageRating.toFixed(1)} · {reviewResult.summary.totalReviews} customer review{reviewResult.summary.totalReviews === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Pricing Tag */}
            <div className="rounded-2xl border border-black/[0.02] bg-[#FAF9F5]/40 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111]/40">Retail Value</span>
              <div className="mt-1 flex items-baseline gap-3">
                <p className="text-3xl font-black text-[#111] tracking-tight">{formatCurrency(product.price)}</p>
                {hasDiscount && (
                  <p className="text-sm font-bold text-[#111]/30 line-through tracking-wide">
                    {formatCurrency(product.compareAtPrice!)}
                  </p>
                )}
              </div>
            </div>

            {/* Size Variant Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black tracking-wide uppercase text-[#111]/45">
                <span>Select Dimensions / Sizes</span>
                <span className="text-[#C4553A]">Variant Guide</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(product.sizes.length ? product.sizes : ["One Size"]).map((size) => {
                  const isSizeActive = selectedSize === size;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl border px-4.5 py-3 text-xs font-black shadow-sm transition-all duration-300 ${
                        isSizeActive
                          ? "border-[#C4553A] bg-[#C4553A]/5 text-[#C4553A]"
                          : "border-black/[0.05] bg-white text-[#111]/60 hover:border-black/20"
                      }`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Availability pills */}
            <div className="rounded-xl border border-black/[0.02] bg-white p-3.5 shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#111]/45">Stock Status</span>
                <span className="text-xs font-black text-[#111] mt-0.5">
                  {product.stock > 0 ? "Available for Dispatch" : "Temporarily Out of Stock"}
                </span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                product.stock === 0
                  ? "bg-red-50 text-red-500"
                  : product.stock < 5
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                {product.stock === 0 ? "Unavailable" : product.stock < 5 ? `Low Stock (${product.stock})` : "In Stock"}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addToPublicCart}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#C4553A] text-xs font-black tracking-wider uppercase text-white shadow-md shadow-[#C4553A]/20 transition-all duration-300 hover:bg-[#a93f25] hover:shadow-lg hover:shadow-[#C4553A]/30"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              Add to Bag
            </motion.button>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black text-[#111]/65 uppercase">
              <button onClick={() => toast.info("Log in to initiate chats.")} className="flex flex-col items-center justify-center rounded-xl border border-black/[0.05] bg-white py-3 shadow-sm transition-colors hover:bg-black/[0.01]">
                <MessageSquare className="mb-1 h-4 w-4 text-[#C4553A]" />
                Inquire
              </button>
              <button onClick={togglePublicWishlist} className="flex flex-col items-center justify-center rounded-xl border border-black/[0.05] bg-white py-3 shadow-sm transition-colors hover:bg-black/[0.01]">
                <Heart className="mb-1 h-4 w-4 text-[#C4553A]" />
                Wishlist
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Page address copied to clipboard!");
              }} className="flex flex-col items-center justify-center rounded-xl border border-black/[0.05] bg-white py-3 shadow-sm transition-colors hover:bg-black/[0.01]">
                <Sparkles className="mb-1 h-4 w-4 text-[#C4553A]" />
                Share look
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Shop the Look - Styling Ideas Upsell Section */}
      {product.stylingIdeas && product.stylingIdeas.length > 0 && (
        <section className="mt-6 rounded-[24px] border border-black/[0.04] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4553A]">Shop the Look</p>
              <h2 className="mt-1 text-xl font-[900] tracking-tight text-[#111]">Complete Your Aesthetics</h2>
            </div>
            <span className="rounded-full bg-[#FAF9F5] border border-black/[0.04] px-4 py-1.5 text-[10px] font-bold text-[#111]/60">
              {product.stylingIdeas.length} accessory suggestion{product.stylingIdeas.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.stylingIdeas.map((idea, index) => {
              const isSelected = addedStylingLook.has(idea.name);
              return (
                <div
                  key={`${idea.name}-${index}`}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4.5 bg-[#FAF9F5]/30 transition-all duration-500 hover:shadow-md ${
                    isSelected
                      ? "border-[#C4553A]/45 bg-[#C4553A]/5 shadow-sm shadow-[#C4553A]/5"
                      : "border-black/[0.03]"
                  }`}
                >
                  <div>
                    {/* Small Image Frame */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-white border border-black/[0.02] flex items-center justify-center p-3 shadow-inner">
                      <Image
                        src={idea.image || product.image}
                        alt={idea.name}
                        fill
                        sizes="160px"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="mt-3.5">
                      <h3 className="text-xs font-black tracking-tight text-[#111] line-clamp-1">{idea.name}</h3>
                      <p className="mt-1 text-[13px] font-extrabold text-[#C4553A]">{formatCurrency(idea.price)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.02] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#111]/40">Accessory Item</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleStylingLook(idea.name)}
                      className={`flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                        isSelected
                          ? "bg-[#C4553A] text-white"
                          : "border border-[#C4553A]/20 bg-[#C4553A]/5 text-[#C4553A] hover:bg-[#C4553A] hover:text-white"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3 w-3" />
                          Selected
                        </>
                      ) : (
                        "Add to look"
                      )}
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tech Specifications and Description Deck */}
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Copy Description Card */}
        <div className="flex flex-col justify-between rounded-[24px] border border-black/[0.04] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 xl:col-span-2">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C4553A]">Product Profile</span>
            <h2 className="mt-1 text-lg font-[900] tracking-tight text-[#111]">Design & Specifications Overview</h2>
            <p className="mt-5 text-sm font-semibold leading-relaxed text-[#111]/60">{product.description || "No specific editorial description provided for this item."}</p>
          </div>
          {product.deliveryNote && (
            <div className="mt-6 rounded-2xl bg-[#FAF9F5] border border-black/[0.03] p-4 text-xs font-bold text-[#111]/60 leading-relaxed">
              <span className="block text-[9px] font-black uppercase tracking-wider text-[#C4553A] mb-1">Dispatch Logistics Note</span>
              {product.deliveryNote}
            </div>
          )}
        </div>

        {/* Specifications Deck Module */}
        <div className="rounded-[24px] border border-black/[0.04] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C4553A]">Specification Deck</span>
          <h2 className="mt-1 text-lg font-[900] tracking-tight text-[#111] mb-5">Technical Properties</h2>

          <div className="space-y-2">
            {[
              ["Material Composition", product.specifications.material],
              ["Maintenance / Care", product.specifications.care],
              ["Dimensions & Pack", product.specifications.packageDimensions],
              ["Released Date", product.specifications.dateFirstAvailable],
              ["Net Weight", product.weight],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col rounded-xl border border-black/[0.02] bg-[#FAF9F5]/40 p-3">
                <span className="text-[8px] font-black uppercase tracking-wider text-[#111]/35">{label}</span>
                <span className="mt-1 text-xs font-extrabold text-[#111]">{value || "Not Standardized"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Showcase boundary */}
      <div className="mt-6 rounded-[24px] border border-black/[0.04] bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6">
        <ProductReviews summary={reviewResult.summary} reviews={reviewResult.reviews} />
      </div>
    </main>
    <PublicAuthPrompt
      open={Boolean(authPrompt)}
      onOpenChange={(open) => !open && setAuthPrompt(null)}
      action={authPrompt || "cart"}
    />
    </>
  );
}
