"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, PackageOpen, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PublicAuthPrompt } from "@/components/shop/PublicAuthPrompt";
import {
  buildPublicCartItems,
  publicShoppingStorage,
  type PublicCartLine,
} from "@/lib/public-shopping";
import { formatCurrency, type SellerProduct } from "@/lib/seller-products";
import { productService } from "@/services/product.service";

const getDeliveryFee = (subtotal: number) => (subtotal >= 100000 || subtotal === 0 ? 0 : 2500);

export default function PublicCartPage() {
  const [cartLines, setCartLines] = useState<PublicCartLine[]>([]);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const loadCart = async () => {
    const localCart = publicShoppingStorage.getCart();
    setCartLines(localCart);

    if (!localCart.length) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const loadedProducts = await Promise.all(
        localCart.map((item) => productService.getPublicProduct(item.productId))
      );
      setProducts(loadedProducts);
    } catch {
      toast.error("Unable to load one or more cart products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCart();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const cartItems = useMemo(() => buildPublicCartItems(cartLines, products), [cartLines, products]);
  const subtotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);
  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateQuantity = (productId: string, quantity: number) => {
    const next = publicShoppingStorage.updateCartItem(productId, quantity);
    setCartLines(next);
  };

  const removeItem = (productId: string) => {
    const next = publicShoppingStorage.removeCartItem(productId);
    setCartLines(next);
    setProducts((current) => current.filter((product) => product.id !== productId));
    toast.success("Item removed from cart.");
  };

  const clearCart = () => {
    publicShoppingStorage.clearCart();
    setCartLines([]);
    setProducts([]);
    toast.success("Cart cleared.");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-5">
        <div className="rounded-[24px] bg-white p-5 text-sm font-black text-[#74746F] shadow-sm sm:rounded-[28px] sm:p-8">
          Loading your cart...
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-5">
        <section className="grid min-h-[70vh] place-items-center rounded-[24px] bg-white p-5 text-center shadow-sm sm:rounded-[32px] sm:p-8">
          <div className="max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFEDE5] text-[#C4553A]">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-[#171714]">Your cart is empty</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#74746F]">
              Browse local products and add what you love. Your public cart will stay here until you sign in.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#171714] px-6 text-sm font-black text-white"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#FAF9F5] px-3 pb-5 pt-24 sm:px-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 rounded-[24px] bg-white shadow-sm sm:rounded-[30px]">
            <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#C4553A]">Public cart</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#171714] sm:text-3xl">Shopping bag</h1>
                <p className="mt-1 text-sm font-semibold text-[#74746F]">{count} item(s) saved locally</p>
              </div>
              <button
                type="button"
                onClick={clearCart}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/[0.08] px-5 text-xs font-black text-[#74746F] transition-colors hover:bg-[#F6F6F4]"
              >
                Clear cart
              </button>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {cartItems.map((item) => {
                const maxQuantity = Math.max(1, item.product.stock);

                return (
                  <article key={item.product.id} className="grid gap-4 p-4 sm:grid-cols-[116px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="relative h-28 overflow-hidden rounded-3xl bg-[#F6F6F4]"
                    >
                      {item.product.image ? (
                        <Image src={item.product.image} alt={item.product.name} fill sizes="116px" className="object-contain p-4" />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] font-black uppercase text-[#8A8A86]">No image</div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#FFEDE5] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#C4553A]">
                          {item.product.category}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A86]">{item.product.brand}</span>
                      </div>
                      <Link href={`/products/${item.product.id}`} className="mt-2 block text-lg font-black leading-tight text-[#171714] hover:text-[#C4553A]">
                        {item.product.name}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#74746F]">
                        {item.product.shortDescription || item.product.description || "Local vendor product"}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center rounded-2xl bg-[#F6F6F4] p-1">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#171714] disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-black text-[#171714]">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={item.quantity >= maxQuantity}
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#171714] disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="inline-flex h-10 items-center gap-2 rounded-2xl px-3 text-xs font-black text-red-600 hover:bg-red-500/[0.06]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-[#74746F]">{formatCurrency(item.product.price)} each</p>
                      <p className="mt-2 text-xl font-black text-[#171714]">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="h-fit rounded-[24px] bg-white p-4 shadow-sm sm:rounded-[30px] sm:p-6 xl:sticky xl:top-24">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171714] text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-[#171714]">Order summary</h2>
            <div className="mt-6 space-y-4 text-sm font-bold">
              <div className="flex justify-between text-[#74746F]">
                <span>Subtotal</span>
                <span className="text-[#171714]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#74746F]">
                <span>Estimated delivery</span>
                <span className="text-[#171714]">{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="border-t border-black/[0.08] pt-4">
                <div className="flex justify-between text-base font-black text-[#171714]">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthPromptOpen(true)}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#C4553A] text-sm font-black text-white shadow-sm shadow-[#C4553A]/20 transition-colors hover:bg-[#a93f25]"
            >
              Sign in to checkout
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/products"
              className="mt-3 flex h-11 items-center justify-center rounded-2xl border border-black/[0.08] text-xs font-black text-[#171714] hover:bg-[#F6F6F4]"
            >
              Keep shopping
            </Link>
          </aside>
        </div>
      </main>
      <PublicAuthPrompt
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        action="checkout"
        nextPath="/buyer/checkout"
      />
    </>
  );
}
