import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { ProductApiResponse } from "@/services/product.service";
import type { OrderItem, OrderStatus, PaymentStatus } from "@/services/order.service";

export type SellerOverview = {
  metrics: {
    grossRevenue: number;
    activeOrders: number;
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    customerRating: number | null;
  };
  weeklySales: {
    label: string;
    revenue: number;
    orders: number;
  }[];
  fulfillmentQueue: {
    status: OrderStatus;
    count: number;
  }[];
  recentOrders: {
    _id: string;
    orderNumber: string;
    buyerName: string;
    buyerCity: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    subtotal: number;
    itemCount: number;
    firstItem?: OrderItem;
    createdAt: string;
  }[];
  lowStockProducts: {
    _id: string;
    name: string;
    image: string;
    stock: number;
    price: number;
    sku?: string;
    status: "Published" | "Draft";
    category: string;
  }[];
};

export type AdminOverview = {
  metrics: {
    totalUsers: number;
    buyers: number;
    vendors: number;
    admins: number;
    activeStores: number;
    suspendedStores: number;
    pendingStores: number;
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    totalOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    grossRevenue: number;
    platformCommission: number;
    pendingRefunds: number;
  };
  weeklySales: {
    label: string;
    revenue: number;
    orders: number;
  }[];
  moderationQueue: {
    label: string;
    count: number;
    priority: string;
  }[];
  recentOrders: {
    _id: string;
    orderNumber: string;
    buyerName: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    total: number;
    itemCount: number;
    createdAt: string;
  }[];
};

export const dashboardService = {
  getAdminOverview: async () => {
    const response = await HTTP.GET<ProductApiResponse<AdminOverview>>(API_ENDPOINTS.DASHBOARD.ADMIN_OVERVIEW);
    return response.data;
  },

  getSellerOverview: async () => {
    const response = await HTTP.GET<ProductApiResponse<SellerOverview>>(API_ENDPOINTS.DASHBOARD.SELLER_OVERVIEW);
    return response.data;
  },
};
