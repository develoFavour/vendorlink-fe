"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  Heart,
  LayoutGrid,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RatingStars } from "@/components/shop/ProductReviews";
import { PublicAuthPrompt } from "@/components/shop/PublicAuthPrompt";
import { publicShoppingStorage } from "@/lib/public-shopping";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService, type ProductPagination } from "@/services/product.service";
import { wishlistService } from "@/services/wishlist.service";
import { cartService } from "@/services/cart.service";

type ProductMarketplaceProps = {
  mode: "buyer" | "public";
};

const DEFAULT_PAGINATION: ProductPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const categories = [
  { label: "All", icon: LayoutGrid },
  { label: "Fashion", icon: Tag },
  { label: "Electronics", icon: Sparkles },
  { label: "Groceries", icon: ShoppingCart },
  { label: "Beauty", icon: Heart },
  { label: "Home", icon: Grid3X3 },
];

const tabs = [
  { label: "New Arrival", icon: Sparkles },
  { label: "Trendy", icon: TrendingUp },
  { label: "Popular", icon: Star },
  { label: "Recommend", icon: Heart },
];

const priceRanges = [
  { label: "All prices", value: "all" },
  { label: "Under ₦5,000", value: "0-5000", minPrice: 0, maxPrice: 5000 },
  { label: "₦5,000 – ₦100,000", value: "5000-100000", minPrice: 5000, maxPrice: 100000 },
  { label: "Above ₦100,000", value: "100000+", minPrice: 100000 },
];

export function ProductMarketplace({ mode }: ProductMarketplaceProps) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [pagination, setPagination] = useState<ProductPagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("New Arrival");
  const [priceRange, setPriceRange] = useState("all");
  const [page, setPage] = useState(1);
  const [previewGalleryIndex, setPreviewGalleryIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [authPrompt, setAuthPrompt] = useState<"cart" | "wishlist" | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const priceFilter = useMemo(
    () => priceRanges.find((range) => range.value === priceRange) || priceRanges[0],
    [priceRange]
  );

  useEffect(() => {
    const request = window.setTimeout(() => {
      setIsLoading(true);
      productService
        .getPublicProducts({
          search,
          category,
          page,
          limit: 12,
          sort: activeTab === "New Arrival" ? "default" : "price_desc",
          minPrice: priceFilter.minPrice,
          maxPrice: priceFilter.maxPrice,
        })
        .then((result) => {
          setProducts(result.products);
          setPagination(result.pagination);
          setPreviewGalleryIndex(0);
          setSelectedProduct((current) => {
            if (current && result.products.some((product) => product.id === current.id)) return current;
            return result.products[0] || null;
          });
        })
        .catch(() => {
          setProducts([]);
          setSelectedProduct(null);
          setPagination(DEFAULT_PAGINATION);
          toast.error("Unable to load products.");
        })
        .finally(() => setIsLoading(false));
    }, 250);

    return () => window.clearTimeout(request);
  }, [activeTab, category, page, priceFilter.maxPrice, priceFilter.minPrice, search]);

  useEffect(() => {
    if (mode !== "buyer") return;

    wishlistService
      .getWishlist()
      .then((result) => setWishlist(new Set(result.productIds)))
      .catch(() => {
        setWishlist(new Set());
      });
  }, [mode]);

  useEffect(() => {
    if (mode !== "public") return;
    const timer = window.setTimeout(() => {
      setWishlist(new Set(publicShoppingStorage.getWishlist()));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [mode]);

  const toggleWishlist = async (id: string) => {
    if (mode !== "buyer") {
      const result = publicShoppingStorage.toggleWishlist(id);
      setWishlist(new Set(result.wishlist));
      toast.success(result.isSaved ? "Saved locally. Sign in to keep it." : "Removed from local wishlist.");
      if (result.isSaved) setAuthPrompt("wishlist");
      return;
    }

    const next = new Set(wishlist);
    const isSaved = next.has(id);

    if (isSaved) {
      next.delete(id);
      setWishlist(next);
      try {
        await wishlistService.remove(id);
        toast.success("Removed from wishlist.");
      } catch {
        setWishlist(new Set(wishlist));
        toast.error("Unable to update wishlist.");
      }
      return;
    }

    next.add(id);
    setWishlist(next);
    try {
      await wishlistService.add(id);
      toast.success("Added to wishlist.");
    } catch {
      setWishlist(new Set(wishlist));
      toast.error("Unable to update wishlist.");
    }
  };

  const addToCart = async (product: SellerProduct) => {
    if (mode !== "buyer") {
      publicShoppingStorage.addToCart(product.id, 1);
      toast.success("Added to public cart.");
      setAuthPrompt("cart");
      return;
    }

    try {
      await cartService.addItem(product.id, 1);
      toast.success("Added to cart.");
    } catch {
      toast.error("Unable to add product to cart.");
    }
  };

  const rootHref = mode === "buyer" ? "/buyer/products" : "/products";
  const activeFiltersCount = (category !== "All" ? 1 : 0) + (priceRange !== "all" ? 1 : 0) + (search ? 1 : 0);

  const selectProduct = (product: SellerProduct) => {
    setSelectedProduct(product);
    setPreviewGalleryIndex(0);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPriceRange("all");
    setPage(1);
  };

  return (
    <>
    <div className="grid overflow-visible rounded-[20px] border border-black/[0.04] bg-[#FAF9F5] shadow-lg shadow-black/[0.02] sm:rounded-[24px] xl:min-h-[calc(100vh-96px)] xl:grid-cols-[210px_1fr_340px] xl:overflow-hidden">
      {/* ─────────────────────────────────────────────────────
          LEFT SIDEBAR: Categories & Filters
         ───────────────────────────────────────────────────── */}
      <aside className="flex flex-col border-b border-black/[0.04] bg-[#FAF9F5]/90 p-4 backdrop-blur-md sm:p-6 xl:border-b-0 xl:border-r">
        {/* Categories */}
        <div>
          <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#111]">
            <LayoutGrid className="h-3.5 w-3.5 text-[#C4553A]" />
            Categories
          </h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:mt-5 xl:block xl:space-y-1.5 xl:overflow-visible xl:pb-0">
            {categories.map((item) => {
              const Icon = item.icon;
              const isActive = category === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setCategory(item.label);
                    setPage(1);
                  }}
                  className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all duration-300 xl:w-full xl:gap-3 xl:px-3.5 xl:py-3 ${
                    isActive
                      ? "bg-[#C4553A]/10 text-[#C4553A] border border-[#C4553A]/15 shadow-sm"
                      : "text-[#111]/60 hover:bg-black/[0.02] hover:text-[#111]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-[#C4553A]" : "text-[#111]/40 group-hover:text-[#111]/70"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="tracking-wide">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeCategoryDot"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C4553A]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-black/[0.04] sm:my-6" />

        {/* Price Filter */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#111]">
              <Filter className="h-3.5 w-3.5 text-[#C4553A]" />
              Price range
            </h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
            {priceRanges.map((range) => {
              const isActive = priceRange === range.value;
              return (
                <label
                  key={range.value}
                  className={`flex shrink-0 cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive ? "bg-white text-[#111] border-black/[0.03] shadow-sm" : "text-[#111]/60 hover:text-[#111] hover:bg-black/[0.01]"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isActive ? "border-[#C4553A] bg-white scale-105" : "border-[#111]/20"
                    }`}
                  >
                    {isActive && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#C4553A]" />
                    )}
                  </span>
                  <input
                    type="radio"
                    checked={isActive}
                    onChange={() => {
                      setPriceRange(range.value);
                      setPage(1);
                    }}
                    className="sr-only"
                  />
                  <span className="tracking-wide">{range.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#C4553A]/20 bg-[#C4553A]/5 text-xs font-black text-[#C4553A] transition-all duration-300 hover:bg-[#C4553A] hover:text-white hover:border-transparent"
          >
            Clear All Filters
          </button>
        )}
      </aside>

      {/* ─────────────────────────────────────────────────────
          CENTER: Product Grid
         ───────────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-col border-b border-black/[0.04] bg-[#FAF9F5]/40 xl:border-b-0 xl:border-r">
        {/* Top Bar: Tabs + Search */}
        <div className="sticky top-0 z-10 border-b border-black/[0.04] bg-[#FAF9F5]/90 px-4 pb-0 pt-4 backdrop-blur-xl sm:px-6 sm:pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.label;
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab.label);
                      setPage(1);
                    }}
                    className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-xs font-black tracking-wide transition-all duration-300 ${
                      isActive
                        ? "bg-[#111] text-white shadow-md shadow-black/10"
                        : "text-[#111]/50 hover:bg-black/[0.02] hover:text-[#111]"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#C4553A]" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-black/[0.03] bg-white px-3.5 text-[#111]/40 shadow-sm transition-all focus-within:border-[#C4553A]/20 focus-within:ring-2 focus-within:ring-[#C4553A]/10 sm:min-w-56">
                <Search className="h-4 w-4 shrink-0 text-[#C4553A]/70" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full bg-transparent text-xs font-bold text-[#111] outline-none placeholder:text-[#111]/30"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="shrink-0 text-[#111]/40 hover:text-[#111]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button className="flex h-11 items-center gap-2 rounded-xl border border-black/[0.04] bg-white px-4 text-xs font-black text-[#111]/60 shadow-sm transition-all hover:bg-black/[0.01] hover:text-[#111]">
                <SlidersHorizontal className="h-4 w-4 text-[#C4553A]" />
                <span className="hidden sm:inline tracking-wide">Sort</span>
              </button>
            </div>
          </div>

          {/* Section Label */}
          <div className="mt-5 flex items-end justify-between pb-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#C4553A]">
                {mode === "buyer" ? "Your Marketplace" : "Browse Catalog"}
              </p>
              <h1 className="mt-1 text-2xl font-[800] tracking-tight text-[#111]">{activeTab}</h1>
            </div>
            <p className="text-xs font-bold text-[#111]/40 tracking-wide">
              {pagination.total} product{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-visible p-4 sm:p-6 xl:overflow-y-auto">
          {isLoading ? (
            /* ── Skeleton Loading Grid ── */
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-black/[0.03] bg-white p-4 shadow-sm">
                  <div className="h-48 rounded-xl bg-[#FAF9F5]" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-[#FAF9F5]" />
                    <div className="h-3 w-1/2 rounded-lg bg-[#FAF9F5]" />
                    <div className="flex items-center justify-between pt-3">
                      <div className="h-5 w-20 rounded-lg bg-[#FAF9F5]" />
                      <div className="h-10 w-10 rounded-xl bg-[#FAF9F5]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* ── Empty State ── */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-[28px] border border-black/[0.03] bg-white px-6 py-16 text-center shadow-sm"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C4553A]/10 shadow-inner">
                <Search className="h-7 w-7 text-[#C4553A]" />
              </div>
              <h3 className="text-lg font-black text-[#111]">No products found</h3>
              <p className="mt-2.5 max-w-sm text-xs font-semibold leading-relaxed text-[#111]/50">
                We couldn&apos;t find anything matching your search. Try resetting filters or using other search keywords.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-[#C4553A] px-6 py-3 text-xs font-black tracking-wide text-white shadow-md shadow-[#C4553A]/20 transition-all duration-300 hover:bg-[#a93f25] hover:shadow-lg"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          ) : (
            /* ── Product Cards Grid ── */
            <motion.div
              layout
              className="grid gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  const isWishlisted = wishlist.has(product.id);
                  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
                  return (
                    <motion.article
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border bg-white p-3 text-left transition-all duration-500 sm:p-4 ${
                        isSelected
                          ? "border-[#C4553A]/45 shadow-lg shadow-[#C4553A]/5 scale-[1.01]"
                          : "border-black/[0.03] shadow-sm hover:border-black/[0.08] hover:shadow-md hover:shadow-black/[0.02]"
                      }`}
                    >
                      <div>
                        {/* Wishlist Button */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all duration-300 sm:right-6 sm:top-6 ${
                            isWishlisted
                              ? "bg-[#C4553A] text-white"
                              : "bg-white/90 text-[#111]/30 hover:text-[#C4553A] hover:bg-white"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                        </motion.button>

                        {/* Discount Badge */}
                        {hasDiscount && (
                          <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#C4553A] px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm sm:left-6 sm:top-6">
                            -{product.discountPercent}%
                          </span>
                        )}

                        {/* Product Image */}
                        <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-black/[0.01] bg-[#FAF9F5]/70 sm:h-48">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="240px"
                            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="mt-4">
                          <div className="min-w-0 flex-1">
                            <span className="inline-block rounded-full bg-black/[0.02] border border-black/[0.03] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#111]/45">
                              {product.brand || product.category}
                            </span>
                            <h3 className="mt-1.5 line-clamp-1 text-sm font-black tracking-tight text-[#111] group-hover:text-[#C4553A] transition-colors duration-300">
                              {product.name}
                            </h3>
                          </div>

                          {/* Rating */}
                          <div className="mt-2.5 flex items-center gap-1">
                            <RatingStars rating={product.averageRating} size="h-3 w-3" />
                            <span className="ml-1 text-[10px] font-black text-[#111]/50">
                              {product.totalReviews > 0
                                ? `${product.averageRating.toFixed(1)} (${product.totalReviews})`
                                : "New Arrival"}
                            </span>
                            {product.soldCount > 0 && (
                              <span className="ml-1 text-[10px] font-bold text-[#111]/30">
                                · {product.soldCount} sold
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price + Cart */}
                      <div className="mt-4 flex items-end justify-between pt-3 border-t border-black/[0.02]">
                        <div>
                          <p className="text-base font-black text-[#111]">{formatCurrency(product.price)}</p>
                          {hasDiscount && (
                            <p className="text-[10px] font-bold text-[#111]/30 line-through">
                              {formatCurrency(product.compareAtPrice!)}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            addToCart(product);
                          }}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${
                            isSelected
                              ? "bg-[#C4553A] text-white shadow-[#C4553A]/25"
                              : "border border-[#C4553A]/20 bg-[#C4553A]/5 text-[#C4553A] hover:bg-[#C4553A] hover:text-white"
                          }`}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Pagination ── */}
          {!isLoading && products.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-1.5">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.03] bg-white text-[#111]/50 shadow-sm transition-colors hover:bg-[#FAF9F5] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black transition-all duration-300 ${
                      page === pageNum
                        ? "bg-[#111] text-white shadow-md shadow-black/10"
                        : "border border-black/[0.03] bg-white text-[#111]/50 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.03] bg-white text-[#111]/50 shadow-sm transition-colors hover:bg-[#FAF9F5] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────
          RIGHT PANEL: Product Preview
         ───────────────────────────────────────────────────── */}
      <aside ref={previewRef} className="hidden overflow-y-auto p-6 xl:block bg-[#FAF9F5]/60">
        <AnimatePresence mode="wait">
          {selectedProduct ? (
            <motion.div
              key={selectedProduct.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ProductPreview
                product={selectedProduct}
                rootHref={rootHref}
                galleryIndex={previewGalleryIndex}
                onGalleryChange={setPreviewGalleryIndex}
                isWishlisted={wishlist.has(selectedProduct.id)}
                onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
                onAddToCart={() => addToCart(selectedProduct)}
              />
            </motion.div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-black/[0.05] p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C4553A]/10 shadow-inner">
                <ShoppingCart className="h-6 w-6 text-[#C4553A]" />
              </div>
              <p className="text-sm font-black text-[#111]">Select a product</p>
              <p className="mt-1.5 text-xs font-bold leading-relaxed text-[#111]/40">Click any card to load the quick-look details preview.</p>
            </div>
          )}
        </AnimatePresence>
      </aside>
    </div>
    <PublicAuthPrompt
      open={Boolean(authPrompt)}
      onOpenChange={(open) => !open && setAuthPrompt(null)}
      action={authPrompt || "cart"}
    />
    </>
  );
}

/* ─────────────────────────────────────────────────────
   Product Preview Panel Component
   ───────────────────────────────────────────────────── */
function ProductPreview({
  product,
  rootHref,
  galleryIndex,
  onGalleryChange,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: {
  product: SellerProduct;
  rootHref: string;
  galleryIndex: number;
  onGalleryChange: (index: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onAddToCart: () => void;
}) {
  const detailHref = `${rootHref}/${product.id}`;
  const gallery = product.gallery.length ? product.gallery : [product.image];
  const currentImage = gallery[galleryIndex] || product.image;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  // Stock Calculation
  const stockPercentage = Math.min((product.stock / 20) * 100, 100);
  const isLowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C4553A]">Quick Look</p>
          <p className="text-xs font-black text-[#111]">Merchandise Details</p>
        </div>
        <Link
          href={detailHref}
          className="rounded-xl border border-black/[0.04] bg-white px-3.5 py-2 text-[10px] font-black tracking-wide text-[#111]/60 shadow-sm transition-all hover:bg-[#111] hover:text-white hover:border-transparent"
        >
          Full View →
        </Link>
      </div>

      {/* Main Image */}
      <div className="relative h-56 overflow-hidden rounded-2xl border border-black/[0.01] bg-[#FAF9F5]/70 flex items-center justify-center shadow-inner">
        <Image
          src={currentImage}
          alt={product.name}
          fill
          sizes="320px"
          className="object-contain p-6 transition-transform duration-500 ease-out hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-4 top-4 rounded-lg bg-[#C4553A] px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm shadow-[#C4553A]/10">
            -{product.discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Gallery Thumbnails */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {gallery.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => onGalleryChange(index)}
              className={`relative h-14 rounded-xl border-2 bg-white flex items-center justify-center p-1 shadow-sm transition-all duration-300 ${
                galleryIndex === index
                  ? "border-[#C4553A] scale-95"
                  : "border-transparent hover:border-black/[0.08]"
              }`}
            >
              <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="56px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      {/* Product Name & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={detailHref}
            className="text-base font-[900] tracking-tight leading-snug text-[#111] hover:text-[#C4553A] transition-colors"
          >
            {product.name}
          </Link>
          <div className="mt-2.5 flex items-center gap-1.5">
            <RatingStars rating={product.averageRating} size="h-3.5 w-3.5" />
            <span className="text-[10px] font-black text-[#111]/50 tracking-wide">
              {product.totalReviews > 0
                ? `${product.averageRating.toFixed(1)} (${product.totalReviews} reviews)`
                : "No reviews yet"}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-[#111]">{formatCurrency(product.price)}</p>
          {hasDiscount && (
            <p className="text-[11px] font-bold text-[#111]/30 line-through tracking-wider">{formatCurrency(product.compareAtPrice!)}</p>
          )}
        </div>
      </div>

      {/* Dynamic Stock Indicator Meter */}
      <div className="rounded-xl border border-black/[0.02] bg-white p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-black tracking-wide uppercase mb-2">
          <span className="text-[#111]/45">Availability Status</span>
          {product.stock === 0 ? (
            <span className="text-red-500">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-amber-500 font-black animate-pulse">Low Stock ({product.stock} Left)</span>
          ) : (
            <span className="text-emerald-500">In Stock ({product.stock})</span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-black/[0.04] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stockPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              product.stock === 0
                ? "bg-red-400"
                : isLowStock
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {[product.category, product.brand].filter(Boolean).map((item) => (
          <span
            key={item}
            className="rounded-lg bg-[#C4553A]/5 border border-[#C4553A]/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#C4553A]"
          >
            {item}
          </span>
        ))}
      </div>

      {/* Size Variants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black tracking-wide uppercase text-[#111]/45">
          <span>Choose Variant</span>
          <Link href={detailHref} className="text-[#C4553A] hover:underline">
            Size Chart
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {(product.sizes.length ? product.sizes : ["One Size"]).slice(0, 6).map((size) => (
            <button
              key={size}
              className="rounded-xl border border-black/[0.05] bg-white px-3.5 py-2.5 text-[11px] font-black text-[#111]/60 shadow-sm transition-all hover:border-[#C4553A] hover:text-[#C4553A]"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddToCart}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#C4553A] text-xs font-black tracking-wider uppercase text-white shadow-md shadow-[#C4553A]/20 transition-all duration-300 hover:bg-[#a93f25] hover:shadow-lg hover:shadow-[#C4553A]/30"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleWishlist}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-xs font-black tracking-wider uppercase shadow-sm transition-all duration-300 ${
            isWishlisted
              ? "border-[#C4553A] bg-[#C4553A]/5 text-[#C4553A]"
              : "border-black/[0.06] bg-white text-[#111]/65 hover:border-black/25"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          {isWishlisted ? "Saved" : "Wishlist"}
        </motion.button>
      </div>

      {/* Accordion Links */}
      <div className="mt-5 divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06] bg-[#FAFAF9]">
        {["Details", "Reviews", "Shipping & return", "Care instructions"].map((item) => (
          <Link
            key={item}
            href={detailHref}
            className="flex items-center justify-between px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#171714] transition-colors hover:bg-white"
          >
            {item}
            <ChevronDown className="h-3.5 w-3.5 text-[#AEAEA9]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
