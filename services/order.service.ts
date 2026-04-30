import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { ProductApiResponse } from "@/services/product.service";

export type PaymentMethod = "Cash on Delivery" | "Paystack";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type OrderStatus = "Pending" | "Processing" | "Ready" | "In Transit" | "Delivered" | "Cancelled";

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
};

export type OrderItem = {
  productId: string;
  vendorId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type OrderStatusHistory = {
  status: OrderStatus;
  note?: string;
  updatedBy: string;
  updatedAt: string;
};

export type BuyerFulfillment = {
  vendorId: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  trackingNote?: string;
  statusHistory: OrderStatusHistory[];
  updatedAt?: string;
};

export type BuyerOrder = {
  _id: string;
  orderNumber: string;
  buyerId: string;
  items: OrderItem[];
  fulfillments: BuyerFulfillment[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentAccessCode?: string;
  paidAt?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type RefundRequestStatus = "Pending" | "Approved" | "Rejected" | "Refunded";

export type RefundRequest = {
  _id: string;
  orderId: string;
  buyerId: string;
  reason: string;
  status: RefundRequestStatus;
  requestedAmount: number;
  deductionPercent: number;
  deductionAmount: number;
  finalRefundAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
};

export type SellerOrder = {
  _id: string;
  orderNumber: string;
  buyerId: string;
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  status: OrderStatus;
  trackingNote?: string;
  items: OrderItem[];
  subtotal: number;
  itemCount: number;
  statusHistory: {
    status: OrderStatus;
    note?: string;
    updatedBy: string;
    updatedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type SellerOrderQueryParams = {
  search?: string;
  status?: OrderStatus | "All";
  paymentStatus?: PaymentStatus | "All";
  paymentMethod?: PaymentMethod | "All";
  from?: string;
  to?: string;
  sort?: "newest" | "oldest" | "total_desc" | "total_asc";
  page?: number;
  limit?: number;
};

export type OrderPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type SellerOrderListResult = {
  orders: SellerOrder[];
  pagination: OrderPagination;
};

export type AdminOrderListResult = {
  orders: BuyerOrder[];
  pagination: OrderPagination;
};

export type CheckoutPayload = {
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
};

export type CheckoutResult = {
  order: BuyerOrder;
  payment?: {
    provider: "paystack";
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
};

const buildOrderQuery = (baseUrl: string, params: SellerOrderQueryParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "All") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const orderService = {
  getOrders: async () => {
    const response = await HTTP.GET<ProductApiResponse<BuyerOrder[]>>(API_ENDPOINTS.ORDERS.GET_ALL);
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await HTTP.GET<ProductApiResponse<BuyerOrder>>(API_ENDPOINTS.ORDERS.GET_ONE(id));
    return response.data;
  },

  checkout: async (payload: CheckoutPayload) => {
    const response = await HTTP.POST<ProductApiResponse<CheckoutResult>>(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
    return response.data;
  },

  verifyPaystackPayment: async (reference: string) => {
    const response = await HTTP.GET<ProductApiResponse<BuyerOrder>>(API_ENDPOINTS.ORDERS.VERIFY_PAYSTACK(reference));
    return response.data;
  },

  cancelOrder: async (id: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<BuyerOrder>>(API_ENDPOINTS.ORDERS.CANCEL(id));
    return response.data;
  },

  requestRefund: async (id: string, reason: string) => {
    const response = await HTTP.POST<ProductApiResponse<RefundRequest>>(API_ENDPOINTS.ORDERS.REQUEST_REFUND(id), { reason });
    return response.data;
  },

  getAdminOrders: async (params: SellerOrderQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<AdminOrderListResult>>(buildOrderQuery(API_ENDPOINTS.ORDERS.GET_ADMIN, params));
    return response.data;
  },

  getSellerOrders: async (params: SellerOrderQueryParams = {}) => {
    const response = await HTTP.GET<ProductApiResponse<SellerOrderListResult>>(buildOrderQuery(API_ENDPOINTS.ORDERS.GET_SELLER, params));
    return response.data;
  },

  getSellerOrder: async (id: string) => {
    const response = await HTTP.GET<ProductApiResponse<SellerOrder>>(API_ENDPOINTS.ORDERS.GET_SELLER_ONE(id));
    return response.data;
  },

  updateSellerOrderStatus: async (id: string, payload: { status: OrderStatus; note?: string }) => {
    const response = await HTTP.PATCH<ProductApiResponse<SellerOrder>>(API_ENDPOINTS.ORDERS.UPDATE_SELLER_STATUS(id), payload);
    return response.data;
  },
};
