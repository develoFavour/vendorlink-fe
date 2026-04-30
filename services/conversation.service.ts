import { API_ENDPOINTS, BASE_URL } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";
import type { ProductApiResponse } from "@/services/product.service";

export type ChatUser = {
  _id: string;
  fullName: string;
  email: string;
};

export type ChatProduct = {
  _id: string;
  name: string;
  image: string;
  price: number;
  brand?: string;
  category?: string;
};

export type Conversation = {
  _id: string;
  buyerId: ChatUser;
  sellerId: ChatUser;
  productId?: ChatProduct;
  orderId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadByBuyer: number;
  unreadBySeller: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  body: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageListResult = {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || BASE_URL.replace(/\/api\/v1$/, "");

export const conversationService = {
  startFromProduct: async (productId: string) => {
    const response = await HTTP.POST<ProductApiResponse<Conversation>>(API_ENDPOINTS.CONVERSATIONS.START, { productId });
    return response.data;
  },

  getConversations: async () => {
    const response = await HTTP.GET<ProductApiResponse<Conversation[]>>(API_ENDPOINTS.CONVERSATIONS.GET_ALL);
    return response.data;
  },

  getMessages: async (conversationId: string) => {
    const response = await HTTP.GET<ProductApiResponse<MessageListResult>>(API_ENDPOINTS.CONVERSATIONS.GET_MESSAGES(conversationId));
    return response.data;
  },

  sendMessage: async (conversationId: string, body: string) => {
    const response = await HTTP.POST<ProductApiResponse<ChatMessage>>(API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversationId), { body });
    return response.data;
  },

  markAsRead: async (conversationId: string) => {
    const response = await HTTP.PATCH<ProductApiResponse<Conversation>>(API_ENDPOINTS.CONVERSATIONS.MARK_READ(conversationId));
    return response.data;
  },
};
