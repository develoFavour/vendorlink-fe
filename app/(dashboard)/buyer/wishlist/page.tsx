"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Heart, PackageOpen, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";

export default function BuyerWishlistPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then((result) => setProducts(result.items))
      .catch(() => toast.error("Unable to load wishlist."))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return products;

    return products.filter((product) =>
      [product.name, product.brand, product.category, ...product.tags]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value))
    );
  }, [products, search]);

  const totalSavedValue = useMemo(
    () => products.reduce((total, product) => total + product.price, 0),
    [products]
  );

  const removeProduct = async (productId: string) => {
    setPendingProductId(productId);

    try {
      const result = await wishlistService.remove(productId);
      setProducts(result.items);
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Unable to remove product.");
    } finally {
      setPendingProductId(null);
    }
  };

  const addToCart = async (product: SellerProduct) => {
    setPendingProductId(product.id);

    try {
      await cartService.addItem(product.id, 1);
      toast.success("Added to cart.");
    } catch {
      toast.error("Unable to add product to cart.");
    } finally {
      setPendingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-sm font-black text-[#74746F] shadow-sm">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">Buyer wishlist</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#171714]">Saved products</h1>
            <p className="mt-1 text-sm font-semibold text-[#74746F]">
              Keep track of local products you want to revisit or move into checkout.
            </p>
          </div>
          <div className="flex rounded-2xl bg-[#F6F6F4] p-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search saved items"
              className="h-10 min-w-0 bg-transparent px-3 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2] sm:w-72"
            />
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#F25A1D] shadow-sm">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Saved items", value: products.length.toString(), detail: "Products in wishlist", icon: Heart },
          { label: "Available now", value: products.filter((product) => product.stock > 0).length.toString(), detail: "Ready to buy", icon: ShoppingCart },
          { label: "Saved value", value: formatCurrency(totalSavedValue), detail: "Current listed price", icon: ArrowRight },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-[26px] bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-[#F25A1D]" />
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8A8A86]">{metric.label}</p>
              <p className="mt-2 text-2xl font-black text-[#171714]">{metric.value}</p>
              <p className="mt-1 text-xs font-bold text-[#74746F]">{metric.detail}</p>
            </div>
          );
        })}
      </section>

      {products.length === 0 ? (
        <section className="grid min-h-[55vh] place-items-center rounded-[32px] bg-white p-8 text-center shadow-sm">
          <div className="max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFEDE5] text-[#F25A1D]">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#171714]">No saved products yet</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">
              Save products while browsing and they will appear here.
            </p>
            <Link href="/buyer/products" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#171714] px-6 text-sm font-black text-white">
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="rounded-[32px] bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black text-[#171714]">No matches</h2>
          <p className="mt-2 text-sm font-semibold text-[#74746F]">Try another product name, brand, or category.</p>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
            const isPending = pendingProductId === product.id;

            return (
              <article key={product.id} className="group overflow-hidden rounded-[30px] bg-white shadow-sm">
                <Link href={`/buyer/products/${product.id}`} className="relative block h-56 bg-[#F6F6F4]">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill sizes="360px" className="object-contain p-8 transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-black uppercase tracking-wider text-[#8A8A86]">No image</div>
                  )}
                  {hasDiscount && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#F25A1D] px-3 py-1.5 text-[10px] font-black text-white">
                      {product.discountPercent}% off
                    </span>
                  )}
                </Link>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#FFEDE5] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#F25A1D]">
                      {product.category}
                    </span>
                    <span className={`text-xs font-black ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                    </span>
                  </div>

                  <Link href={`/buyer/products/${product.id}`} className="mt-4 block text-lg font-black leading-tight text-[#171714] hover:text-[#F25A1D]">
                    {product.name}
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#74746F]">
                    {product.shortDescription || product.description || product.brand}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-black text-[#171714]">{formatCurrency(product.price)}</p>
                      {hasDiscount && (
                        <p className="mt-1 text-xs font-bold text-[#8A8A86] line-through">{formatCurrency(product.compareAtPrice!)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => removeProduct(product.id)}
                        className="grid h-11 w-11 place-items-center rounded-2xl border border-black/[0.08] text-red-600 hover:bg-red-500/[0.06] disabled:opacity-50"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending || product.stock < 1}
                        onClick={() => addToCart(product)}
                        className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F25A1D] text-white shadow-sm shadow-[#F25A1D]/20 disabled:opacity-50"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
