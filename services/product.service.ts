import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { SellerProduct } from "@/lib/seller-products";

export type ProductPayload = Omit<SellerProduct, "id" | "dateListed" | "gallery" | "sizes" | "tags"> & {
  dateListed?: string;
  gallery: string | string[];
  sizes: string | string[];
  tags: string | string[];
};

export type ProductApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type ApiProduct = SellerProduct & {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductQueryParams = {
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ProductListResult = {
  products: SellerProduct[];
  pagination: ProductPagination;
};

type ApiProductListResult = {
  products: ApiProduct[];
  pagination: ProductPagination;
};

const DEFAULT_PAGINATION: ProductPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

const buildProductQuery = (baseUrl: string, params: ProductQueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "All") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const normalizeApiProduct = (product: ApiProduct): SellerProduct => ({
  ...product,
  id: product._id || product.id,
  brand: product.brand || "",
  shortDescription: product.shortDescription || "",
  description: product.description || "",
  image: product.image || "",
  gallery: product.gallery || [],
  soldCount: product.soldCount || 0,
  averageRating: product.averageRating || 0,
  totalReviews: product.totalReviews || 0,
  color: product.color || "#F3F3F1",
  sku: product.sku || "",
  weight: product.weight || "",
  deliveryNote: product.deliveryNote || "",
  sizes: product.sizes || [],
  tags: product.tags || [],
  specifications: product.specifications || {
    material: "",
    care: "",
    packageDimensions: "",
    department: "",
    protection: "",
    dateFirstAvailable: "",
  },
  stylingIdeas: product.stylingIdeas || [],
  dateListed: product.createdAt
    ? new Date(product.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : product.dateListed,
});

export const productService = {
  getProducts: async (params: ProductQueryParams = {}): Promise<ProductListResult> => {
    const response = await HTTP.GET<ProductApiResponse<ApiProductListResult>>(buildProductQuery(API_ENDPOINTS.PRODUCTS.GET_ALL, params));

    return {
      products: response.data.products.map(normalizeApiProduct),
      pagination: response.data.pagination || DEFAULT_PAGINATION,
    };
  },

  getPublicProducts: async (params: ProductQueryParams = {}): Promise<ProductListResult> => {
    const response = await HTTP.GET<ProductApiResponse<ApiProductListResult>>(buildProductQuery(API_ENDPOINTS.PRODUCTS.GET_PUBLIC, params));

    return {
      products: response.data.products.map(normalizeApiProduct),
      pagination: response.data.pagination || DEFAULT_PAGINATION,
    };
  },

  getProduct: async (id: string) => {
    const response = await HTTP.GET<ProductApiResponse<ApiProduct>>(API_ENDPOINTS.PRODUCTS.GET_ONE(id));
    return normalizeApiProduct(response.data);
  },

  getPublicProduct: async (id: string) => {
    const response = await HTTP.GET<ProductApiResponse<ApiProduct>>(API_ENDPOINTS.PRODUCTS.GET_PUBLIC_ONE(id));
    return normalizeApiProduct(response.data);
  },

  createProduct: async (payload: ProductPayload | FormData) => {
    const response = await HTTP.POST<ProductApiResponse<ApiProduct>>(API_ENDPOINTS.PRODUCTS.CREATE, payload);
    return normalizeApiProduct(response.data);
  },

  updateProduct: async (id: string, payload: Partial<ProductPayload> | FormData) => {
    const response = await HTTP.PATCH<ProductApiResponse<ApiProduct>>(API_ENDPOINTS.PRODUCTS.UPDATE(id), payload);
    return normalizeApiProduct(response.data);
  },

  deleteProduct: async (id: string) => {
    return HTTP.DELETE<ProductApiResponse<null>>(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
