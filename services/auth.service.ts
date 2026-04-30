import { API_ENDPOINTS } from "@/constants/endpoint.const";
import { HTTP } from "@/methods/http";

export type UserRole = "BUYER" | "VENDOR" | "ADMIN";

export type AuthUser = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
};

export type AuthResponse = {
  statusCode: number;
  data: {
    user: AuthUser;
    store?: {
      _id: string;
      storeName: string;
      slug: string;
      category?: string;
      status: string;
    } | null;
  };
  message: string;
  success: boolean;
};

export type BuyerRegistrationPayload = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export type VendorRegistrationPayload = BuyerRegistrationPayload & {
  storeName: string;
  category: string;
  address: string;
  bankName: string;
  accountNumber: string;
  cacNumber?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const authService = {
  registerBuyer: (payload: BuyerRegistrationPayload) =>
    HTTP.POST<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER_BUYER, payload),

  registerVendor: (payload: VendorRegistrationPayload) =>
    HTTP.POST<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER_VENDOR, payload),

  login: (payload: LoginPayload) =>
    HTTP.POST<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload),

  verifyEmail: (token: string) =>
    HTTP.POST<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  refresh: () => HTTP.POST<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH),

  me: () => HTTP.GET<AuthResponse>(API_ENDPOINTS.AUTH.ME),

  logout: () => HTTP.POST(API_ENDPOINTS.AUTH.LOGOUT),
};
