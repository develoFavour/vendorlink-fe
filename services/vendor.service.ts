import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import { normalizeApiProduct, type ApiProduct, type ProductPagination } from "@/services/product.service";
import type { SellerProduct } from "@/lib/seller-products";

export type PublicVendor = {
  _id: string;
  storeName: string;
  slug: string;
  description?: string;
  category: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
};

type VendorApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const DEFAULT_PAGINATION: ProductPagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

type VendorListResult = {
  stores: PublicVendor[];
  pagination: ProductPagination;
};

type VendorDetailsResult = {
  store: PublicVendor;
  products: SellerProduct[];
  pagination: ProductPagination;
};

export const vendorService = {
  getVendors: async (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<VendorListResult> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await HTTP.GET<VendorApiResponse<VendorListResult>>(`${API_ENDPOINTS.VENDORS.GET_ALL}${query ? `?${query}` : ''}`);

    return {
      stores: response.data?.stores || [],
      pagination: response.data?.pagination || DEFAULT_PAGINATION,
    };
  },

  getVendorBySlug: async (slug: string, params?: { page?: number; limit?: number }): Promise<VendorDetailsResult> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await HTTP.GET<VendorApiResponse<{ store: PublicVendor; products: ApiProduct[]; pagination: ProductPagination }>>(
      `${API_ENDPOINTS.VENDORS.GET_ONE(slug)}${query ? `?${query}` : ''}`
    );

    return {
      store: response.data.store,
      products: (response.data.products || []).map(normalizeApiProduct),
      pagination: response.data.pagination || DEFAULT_PAGINATION,
    };
  },
};
