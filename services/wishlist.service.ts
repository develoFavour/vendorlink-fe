import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { SellerProduct } from "@/lib/seller-products";
import { normalizeApiProduct, type ApiProduct, type ProductApiResponse } from "@/services/product.service";

type ApiWishlistItem = {
  _id: string;
  productId: ApiProduct;
  createdAt: string;
  updatedAt: string;
};

export type WishlistResult = {
  items: SellerProduct[];
  productIds: string[];
  count: number;
};

type ApiWishlistResult = {
  items: ApiWishlistItem[];
  productIds: string[];
  count: number;
};

const normalizeWishlist = (wishlist: ApiWishlistResult): WishlistResult => ({
  items: wishlist.items
    .filter((item) => item.productId)
    .map((item) => normalizeApiProduct(item.productId)),
  productIds: wishlist.productIds || [],
  count: wishlist.count || 0,
});

export const wishlistService = {
  getWishlist: async () => {
    const response = await HTTP.GET<ProductApiResponse<ApiWishlistResult>>(API_ENDPOINTS.WISHLIST.GET);
    return normalizeWishlist(response.data);
  },

  add: async (productId: string) => {
    const response = await HTTP.POST<ProductApiResponse<ApiWishlistResult>>(API_ENDPOINTS.WISHLIST.ADD(productId));
    return normalizeWishlist(response.data);
  },

  remove: async (productId: string) => {
    const response = await HTTP.DELETE<ProductApiResponse<ApiWishlistResult>>(API_ENDPOINTS.WISHLIST.REMOVE(productId));
    return normalizeWishlist(response.data);
  },
};
