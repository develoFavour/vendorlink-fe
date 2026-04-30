import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { ProductApiResponse } from "@/services/product.service";
import type { UserRole } from "@/services/auth.service";

export type AccountStatus = "ACTIVE" | "SUSPENDED";
export type StoreStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AdminUser = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminVendor = {
  _id: string;
  vendorId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    accountStatus: AccountStatus;
    isVerified: boolean;
    createdAt: string;
  };
  vendorName: string;
  vendorEmail: string;
  vendorStatus: AccountStatus;
  storeName: string;
  slug: string;
  category: string;
  address: string;
  status: StoreStatus;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AdminListQuery = {
  search?: string;
  role?: UserRole | "All";
  status?: AccountStatus | StoreStatus | "All";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
};

export type AdminUserListResult = {
  users: AdminUser[];
  pagination: AdminPagination;
};

export type AdminVendorListResult = {
  vendors: AdminVendor[];
  pagination: AdminPagination;
};

const buildAdminQuery = (baseUrl: string, params: AdminListQuery = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "All") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const adminService = {
  getUsers: async (params: AdminListQuery = {}) => {
    const response = await HTTP.GET<ProductApiResponse<AdminUserListResult>>(
      buildAdminQuery(API_ENDPOINTS.ADMIN.GET_USERS, params)
    );
    return response.data;
  },

  updateUserStatus: async (userId: string, status: AccountStatus) => {
    const response = await HTTP.PATCH<ProductApiResponse<AdminUser>>(
      API_ENDPOINTS.ADMIN.UPDATE_USER_STATUS(userId),
      { status }
    );
    return response.data;
  },

  getVendors: async (params: AdminListQuery = {}) => {
    const response = await HTTP.GET<ProductApiResponse<AdminVendorListResult>>(
      buildAdminQuery(API_ENDPOINTS.ADMIN.GET_VENDORS, params)
    );
    return response.data;
  },

  updateVendorStatus: async (storeId: string, status: StoreStatus) => {
    const response = await HTTP.PATCH<ProductApiResponse<AdminVendor>>(
      API_ENDPOINTS.ADMIN.UPDATE_VENDOR_STATUS(storeId),
      { status }
    );
    return response.data;
  },
};
