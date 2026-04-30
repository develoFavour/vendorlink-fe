import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { SellerProduct } from "@/lib/seller-products";
import { normalizeApiProduct, type ApiProduct, type ProductApiResponse } from "@/services/product.service";

export type CartItem = {
  product: SellerProduct;
  quantity: number;
  lineTotal: number;
};

export type CartResult = {
  items: CartItem[];
  count: number;
  subtotal: number;
};

type ApiCartItem = {
  product: ApiProduct;
  quantity: number;
  lineTotal: number;
};

type ApiCartResult = {
  items: ApiCartItem[];
  count: number;
  subtotal: number;
};

const normalizeCart = (cart: ApiCartResult): CartResult => ({
  items: cart.items.map((item) => {
    const product = normalizeApiProduct(item.product);

    return {
      product,
      quantity: item.quantity,
      lineTotal: item.lineTotal || product.price * item.quantity,
    };
  }),
  count: cart.count || 0,
  subtotal: cart.subtotal || 0,
});

export const cartService = {
  getCart: async () => {
    const response = await HTTP.GET<ProductApiResponse<ApiCartResult>>(API_ENDPOINTS.CART.GET);
    return normalizeCart(response.data);
  },

  addItem: async (productId: string, quantity = 1) => {
    const response = await HTTP.POST<ProductApiResponse<ApiCartResult>>(API_ENDPOINTS.CART.ADD_ITEM(productId), { quantity });
    return normalizeCart(response.data);
  },

  updateItem: async (productId: string, quantity: number) => {
    const response = await HTTP.PATCH<ProductApiResponse<ApiCartResult>>(API_ENDPOINTS.CART.UPDATE_ITEM(productId), { quantity });
    return normalizeCart(response.data);
  },

  removeItem: async (productId: string) => {
    const response = await HTTP.DELETE<ProductApiResponse<ApiCartResult>>(API_ENDPOINTS.CART.REMOVE_ITEM(productId));
    return normalizeCart(response.data);
  },

  clear: async () => {
    const response = await HTTP.DELETE<ProductApiResponse<ApiCartResult>>(API_ENDPOINTS.CART.CLEAR);
    return normalizeCart(response.data);
  },
};
