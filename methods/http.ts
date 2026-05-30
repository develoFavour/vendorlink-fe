import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_ENDPOINTS, BASE_URL } from '@/constants/endpoint.const';
import { handleApiError } from '@/utils/response';
import {
  clearFrontendAuthSession,
  getFrontendAccessToken,
  getFrontendRefreshToken,
  setFrontendAuthSession,
} from '@/lib/auth-session';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 90000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _networkRetry?: boolean;
  url?: string;
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginUrl = new URL('/auth/login', window.location.origin);
  if (!window.location.pathname.startsWith('/auth')) {
    loginUrl.searchParams.set('next', currentPath);
  }

  window.location.href = loginUrl.toString();
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const accessToken = getFrontendAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const method = originalRequest?.method?.toLowerCase();
    const isSafeRetry =
      originalRequest &&
      method === 'get' &&
      !originalRequest._networkRetry &&
      (error.code === 'ECONNABORTED' || !error.response || (status && status >= 500));
    const isAuthRecoveryRequest =
      url.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      url.includes(API_ENDPOINTS.AUTH.LOGOUT) ||
      url.includes(API_ENDPOINTS.AUTH.REFRESH);

    if (isSafeRetry && !isAuthRecoveryRequest) {
      originalRequest._networkRetry = true;
      await wait(900);
      return axiosInstance(originalRequest);
    }

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRecoveryRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = getFrontendRefreshToken();
        const refreshResponse = await axiosInstance.post(
          API_ENDPOINTS.AUTH.REFRESH,
          refreshToken ? { refreshToken } : undefined
        );
        const data = refreshResponse.data?.data;

        if (data?.user?.role) {
          setFrontendAuthSession(data.user.role, data.token, data.refreshToken);
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        try {
          await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch {
          // The refresh token may already be invalid; redirecting is enough for the user flow.
        }

        clearFrontendAuthSession();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && !isAuthRecoveryRequest) {
      redirectToLogin();
    }

    handleApiError(error);
    return Promise.reject(error);
  }
);

export const HTTP = {
  GET: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.get(url, config);
    return response.data;
  },
  POST: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
    return response.data;
  },
  PUT: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
    return response.data;
  },
  PATCH: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
    return response.data;
  },
  DELETE: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
    return response.data;
  },
};
