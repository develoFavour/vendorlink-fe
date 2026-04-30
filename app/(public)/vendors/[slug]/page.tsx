'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { vendorService } from '@/services/vendor.service';
import { formatCurrency, SellerProduct } from '@/lib/seller-products';
import { RatingStars } from '@/components/shop/ProductReviews';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Store, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cartService } from '@/services/cart.service';
import { wishlistService } from '@/services/wishlist.service';
import { publicShoppingStorage } from '@/lib/public-shopping';
import { toast } from 'sonner';
import { PublicAuthPrompt } from '@/components/shop/PublicAuthPrompt';

export default function VendorDetailsPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [authPrompt, setAuthPrompt] = useState<"cart" | "wishlist" | null>(null);

  useEffect(() => {
    // Initialize wishlist from local storage for public mode
    const timer = window.setTimeout(() => {
      setWishlist(new Set(publicShoppingStorage.getWishlist()));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getVendorBySlug(slug, { page, limit: 12 });
      setVendor(data.store);
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch vendor details:', error);
      toast.error('Failed to load vendor details');
      router.push('/vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchVendorDetails();
    }
  }, [slug, page]);

  const toggleWishlist = (id: string) => {
    const result = publicShoppingStorage.toggleWishlist(id);
    setWishlist(new Set(result.wishlist));
    toast.success(result.isSaved ? "Saved locally. Sign in to keep it." : "Removed from local wishlist.");
    if (result.isSaved) setAuthPrompt("wishlist");
  };

  const addToCart = (product: SellerProduct) => {
    publicShoppingStorage.addToCart(product.id, 1);
    toast.success("Added to public cart.");
    setAuthPrompt("cart");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-20 mt-20 text-center">
        <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold">Vendor not found</h2>
        <Link href="/vendors" className="text-primary hover:underline mt-4 inline-block">
          Return to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Vendor Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 mb-8 shadow-sm border border-black/[0.04] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-[#C4553A]/10 flex items-center justify-center shrink-0">
            <Store className="h-10 w-10 sm:h-14 sm:w-14 text-[#C4553A]" />
          </div>
          <div className="flex-1">
            <div className="inline-block rounded-full bg-[#C4553A]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#C4553A] mb-2">
              {vendor.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-[900] tracking-tight text-[#111] mb-2">
              {vendor.storeName}
            </h1>
            {vendor.address && (
              <p className="flex items-center text-sm font-medium text-[#111]/60 mb-4">
                <MapPin className="h-4 w-4 mr-1.5" />
                {vendor.address}
              </p>
            )}
            <p className="text-[#111]/70 max-w-3xl text-sm sm:text-base">
              {vendor.description || "Welcome to our store! We offer a wide range of quality products."}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#111]">Products</h2>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
              {products.map((product) => {
                const isWishlisted = wishlist.has(product._id || product.id);
                const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
                const productId = product._id || product.id;
                
                return (
                  <article
                    key={productId}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-black/[0.03] bg-white p-3 text-left shadow-sm transition-all duration-300 hover:border-black/[0.08] hover:shadow-md sm:p-4"
                  >
                    <div>
                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(productId);
                        }}
                        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all duration-300 sm:right-6 sm:top-6 ${
                          isWishlisted
                            ? "bg-[#C4553A] text-white"
                            : "bg-white/90 text-[#111]/30 hover:text-[#C4553A] hover:bg-white"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                      </button>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute left-4 top-4 z-10 rounded-lg bg-[#C4553A] px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-sm sm:left-6 sm:top-6">
                          -{product.discountPercent}%
                        </span>
                      )}

                      {/* Product Image */}
                      <Link href={`/products/${productId}`}>
                        <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-black/[0.01] bg-[#FAF9F5]/70 sm:h-48">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="240px"
                            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="mt-4">
                        <div className="min-w-0 flex-1">
                          <span className="inline-block rounded-full bg-black/[0.02] border border-black/[0.03] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#111]/45">
                            {product.brand || product.category}
                          </span>
                          <Link href={`/products/${productId}`}>
                            <h3 className="mt-1.5 line-clamp-1 text-sm font-black tracking-tight text-[#111] group-hover:text-[#C4553A] transition-colors duration-300">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Rating */}
                        <div className="mt-2.5 flex items-center gap-1">
                          <RatingStars rating={product.averageRating || 0} size="h-3 w-3" />
                          <span className="ml-1 text-[10px] font-black text-[#111]/50">
                            {product.totalReviews > 0
                              ? `${(product.averageRating || 0).toFixed(1)} (${product.totalReviews})`
                              : "No reviews"}
                          </span>
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C4553A]/20 bg-[#C4553A]/5 text-[#C4553A] shadow-sm transition-all duration-300 hover:bg-[#C4553A] hover:text-white"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.03] bg-white text-[#111]/50 shadow-sm transition-colors hover:bg-[#FAF9F5] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
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
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.03] bg-white text-[#111]/50 shadow-sm transition-colors hover:bg-[#FAF9F5] disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.04]">
            <ShoppingCart className="h-16 w-16 mx-auto text-[#111]/20 mb-4" />
            <h2 className="text-xl font-bold text-[#111] mb-2">No products found</h2>
            <p className="text-[#111]/50 text-sm">This vendor hasn't published any products yet.</p>
          </div>
        )}
      </div>

      <PublicAuthPrompt
        open={Boolean(authPrompt)}
        onOpenChange={(open) => !open && setAuthPrompt(null)}
        action={authPrompt || "cart"}
      />
    </div>
  );
}
