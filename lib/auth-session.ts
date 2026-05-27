export type FrontendUserRole = "BUYER" | "VENDOR" | "ADMIN";

const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const ACCESS_TOKEN_KEY = "vendorlink_access_token";
const REFRESH_TOKEN_KEY = "vendorlink_refresh_token";

const writeCookie = (name: string, value: string, maxAge = SESSION_COOKIE_MAX_AGE) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const setFrontendAuthSession = (role: FrontendUserRole, accessToken?: string, refreshToken?: string) => {
  writeCookie("auth_session", "1");
  writeCookie("auth_role", role);

  if (typeof window === "undefined") return;

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearFrontendAuthSession = () => {
  writeCookie("auth_session", "", 0);
  writeCookie("auth_role", "", 0);

  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getFrontendAccessToken = () => {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getFrontendRefreshToken = () => {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};
