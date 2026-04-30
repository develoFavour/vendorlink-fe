"use client";

import type { SellerProduct } from "@/lib/seller-products";
import { cartService } from "@/services/cart.service";
import { wishlistService } from "@/services/wishlist.service";

const PUBLIC_CART_KEY = "vendorlink_public_cart";
const PUBLIC_WISHLIST_KEY = "vendorlink_public_wishlist";

export type PublicCartLine = {
  productId: string;
  quantity: number;
};

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("vendorlink-public-cart-updated"));
};

export const publicShoppingStorage = {
  getCart: () => readJson<PublicCartLine[]>(PUBLIC_CART_KEY, []),

  getCartCount: () =>
    publicShoppingStorage
      .getCart()
      .reduce((total, item) => total + Math.max(Number(item.quantity) || 0, 0), 0),

  addToCart: (productId: string, quantity = 1) => {
    const cart = publicShoppingStorage.getCart();
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
      writeJson(PUBLIC_CART_KEY, cart);
      return cart;
    }

    const next = [...cart, { productId, quantity }];
    writeJson(PUBLIC_CART_KEY, next);
    return next;
  },

  updateCartItem: (productId: string, quantity: number) => {
    const next = publicShoppingStorage
      .getCart()
      .map((item) => (item.productId === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    writeJson(PUBLIC_CART_KEY, next);
    return next;
  },

  removeCartItem: (productId: string) => {
    const next = publicShoppingStorage.getCart().filter((item) => item.productId !== productId);
    writeJson(PUBLIC_CART_KEY, next);
    return next;
  },

  clearCart: () => writeJson(PUBLIC_CART_KEY, []),

  getWishlist: () => readJson<string[]>(PUBLIC_WISHLIST_KEY, []),

  toggleWishlist: (productId: string) => {
    const wishlist = publicShoppingStorage.getWishlist();
    const exists = wishlist.includes(productId);
    const next = exists ? wishlist.filter((id) => id !== productId) : [...wishlist, productId];
    writeJson(PUBLIC_WISHLIST_KEY, next);
    return { wishlist: next, isSaved: !exists };
  },

  clearWishlist: () => writeJson(PUBLIC_WISHLIST_KEY, []),
};

export const buildPublicCartItems = (
  cart: PublicCartLine[],
  products: SellerProduct[]
) => {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return cart
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      const quantity = Math.max(item.quantity, 1);

      return {
        product,
        quantity,
        lineTotal: product.price * quantity,
      };
    })
    .filter(Boolean) as { product: SellerProduct; quantity: number; lineTotal: number }[];
};

export const syncPublicShoppingToBuyer = async () => {
  const cart = publicShoppingStorage.getCart();
  const wishlist = publicShoppingStorage.getWishlist();

  if (cart.length) {
    await Promise.all(
      cart.map((item) => cartService.addItem(item.productId, Math.max(item.quantity, 1)))
    );
    publicShoppingStorage.clearCart();
  }

  if (wishlist.length) {
    await Promise.all(wishlist.map((productId) => wishlistService.add(productId)));
    publicShoppingStorage.clearWishlist();
  }
};
