import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { ProductApiResponse } from "@/services/product.service";

export type ReviewSummary = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
};

export type ProductReview = {
  _id: string;
  productId: string;
  buyerId: string | { _id: string; fullName?: string };
  buyerName: string;
  product?: {
    _id: string;
    name: string;
    image: string;
    price: number;
    category: string;
  };
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  moderationStatus: "VISIBLE" | "HIDDEN";
  hiddenReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ReviewListResult = {
  summary: ReviewSummary;
  reviews: ProductReview[];
  pagination: ReviewPagination;
};

export type ReviewEligibility = {
  canReview: boolean;
  reason: string;
  orderId?: string;
  existingReview: ProductReview | null;
};

export type ReviewPayload = {
  rating: number;
  title?: string;
  comment?: string;
};

export type ReviewQueryParams = {
  page?: number;
  limit?: number;
  rating?: number | "All";
  status?: "VISIBLE" | "HIDDEN" | "All";
  search?: string;
  sort?: "newest" | "oldest" | "rating_high" | "rating_low";
};

const buildReviewQuery = (baseUrl: string, params: ReviewQueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "All") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const reviewService = {
  getAdminReviews: async (params: ReviewQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<ReviewListResult>>(
      buildReviewQuery(API_ENDPOINTS.REVIEWS.GET_ADMIN, params)
    );
    return response.data;
  },

  hideReview: async (reviewId: string, reason?: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<ProductReview>>(
      API_ENDPOINTS.REVIEWS.HIDE_ADMIN(reviewId),
      { reason }
    );
    return response.data;
  },

  restoreReview: async (reviewId: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<ProductReview>>(
      API_ENDPOINTS.REVIEWS.RESTORE_ADMIN(reviewId)
    );
    return response.data;
  },

  deleteReviewAsAdmin: async (reviewId: string) => {
    return HTTP.DELETE<ProductApiResponse<null>>(API_ENDPOINTS.REVIEWS.DELETE_ADMIN(reviewId));
  },

  getProductReviews: async (productId: string, params: ReviewQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<ReviewListResult>>(
      buildReviewQuery(API_ENDPOINTS.REVIEWS.GET_PRODUCT(productId), params)
    );
    return response.data;
  },

  getEligibility: async (productId: string) => {
    const response = await HTTP.GET<ProductApiResponse<ReviewEligibility>>(
      API_ENDPOINTS.REVIEWS.GET_ELIGIBILITY(productId)
    );
    return response.data;
  },

  createReview: async (productId: string, payload: ReviewPayload) => {
    const response = await HTTP.POST<ProductApiResponse<ProductReview>>(
      API_ENDPOINTS.REVIEWS.CREATE(productId),
      payload
    );
    return response.data;
  },

  updateMyReview: async (productId: string, payload: ReviewPayload) => {
    const response = await HTTP.PATCH<ProductApiResponse<ProductReview>>(
      API_ENDPOINTS.REVIEWS.UPDATE_MY(productId),
      payload
    );
    return response.data;
  },

  deleteMyReview: async (productId: string) => {
    return HTTP.DELETE<ProductApiResponse<null>>(API_ENDPOINTS.REVIEWS.DELETE_MY(productId));
  },

  getSellerReviews: async (params: ReviewQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<ReviewListResult>>(
      buildReviewQuery(API_ENDPOINTS.REVIEWS.GET_SELLER, params)
    );
    return response.data;
  },
};
