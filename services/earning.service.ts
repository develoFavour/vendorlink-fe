import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { PaymentMethod } from "@/services/order.service";
import type { ProductApiResponse } from "@/services/product.service";

export type VendorEarningStatus = "Pending" | "Available" | "Cancelled";
export type WithdrawalStatus = "Pending" | "Approved" | "Processing" | "Paid" | "Rejected" | "Failed";

export type VendorEarning = {
  _id: string;
  vendorId: string;
  orderId: string;
  orderNumber: string;
  itemsSubtotal: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  status: VendorEarningStatus;
  availableAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type WithdrawalRequest = {
  _id: string;
  vendorId: string;
  vendorName?: string;
  vendorEmail?: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  vendorNote?: string;
  adminNote?: string;
  approvedAt?: string;
  paidAt?: string;
  paystackTransferReference?: string;
  paystackTransferStatus?: string;
  createdAt: string;
  updatedAt: string;
};

export type EarningsBalance = {
  grossSales: number;
  commission: number;
  netEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  reservedBalance: number;
  withdrawnBalance: number;
  cancelledBalance: number;
};

export type SellerEarningsOverview = {
  balance: EarningsBalance;
  commissionRate: number;
  payoutMode: string;
  minimumWithdrawalAmount: number;
  recentEarnings: VendorEarning[];
  withdrawals: WithdrawalRequest[];
};

export type EarningsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type EarningQueryParams = {
  search?: string;
  status?: VendorEarningStatus | WithdrawalStatus | "All";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
};

export type SellerEarningListResult = {
  earnings: VendorEarning[];
  pagination: EarningsPagination;
};

export type WithdrawalPayload = {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  vendorNote?: string;
};

export type AdminEarningsSummary = {
  payoutMode: string;
  commissionRate: number;
  grossSales: number;
  commission: number;
  vendorNet: number;
  pendingWithdrawals: number;
  paidWithdrawals: number;
};

export type AdminWithdrawalListResult = {
  withdrawals: WithdrawalRequest[];
  metrics: {
    pendingAmount: number;
    paidAmount: number;
    pendingCount: number;
    processingCount: number;
  };
  payoutMode: string;
  pagination: EarningsPagination;
};

const buildEarningQuery = (baseUrl: string, params: EarningQueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "All") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const earningService = {
  getSellerOverview: async () => {
    const response = await HTTP.GET<ProductApiResponse<SellerEarningsOverview>>(
      API_ENDPOINTS.EARNINGS.SELLER_OVERVIEW
    );
    return response.data;
  },

  getSellerEarnings: async (params: EarningQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<SellerEarningListResult>>(
      buildEarningQuery(API_ENDPOINTS.EARNINGS.SELLER_LIST, params)
    );
    return response.data;
  },

  requestWithdrawal: async (payload: WithdrawalPayload) => {
    const response = await HTTP.POST<ProductApiResponse<WithdrawalRequest>>(
      API_ENDPOINTS.EARNINGS.REQUEST_WITHDRAWAL,
      payload
    );
    return response.data;
  },

  getAdminSummary: async () => {
    const response = await HTTP.GET<ProductApiResponse<AdminEarningsSummary>>(
      API_ENDPOINTS.EARNINGS.ADMIN_SUMMARY
    );
    return response.data;
  },

  getAdminWithdrawals: async (params: EarningQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<AdminWithdrawalListResult>>(
      buildEarningQuery(API_ENDPOINTS.EARNINGS.ADMIN_WITHDRAWALS, params)
    );
    return response.data;
  },

  approveWithdrawal: async (id: string, note?: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<WithdrawalRequest>>(
      API_ENDPOINTS.EARNINGS.APPROVE_WITHDRAWAL(id),
      { note }
    );
    return response.data;
  },

  rejectWithdrawal: async (id: string, note?: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<WithdrawalRequest>>(
      API_ENDPOINTS.EARNINGS.REJECT_WITHDRAWAL(id),
      { note }
    );
    return response.data;
  },

  processWithdrawal: async (id: string, note?: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<WithdrawalRequest>>(
      API_ENDPOINTS.EARNINGS.PROCESS_WITHDRAWAL(id),
      { note }
    );
    return response.data;
  },

  confirmWithdrawalPaid: async (id: string, note?: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<WithdrawalRequest>>(
      API_ENDPOINTS.EARNINGS.CONFIRM_WITHDRAWAL_PAID(id),
      { note }
    );
    return response.data;
  },
};
