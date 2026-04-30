import { NextResponse, type NextRequest } from "next/server";

const authPages = [
  "/auth/login",
  "/auth/login/admin",
  "/auth/login/buyer",
  "/auth/login/seller",
  "/auth/register",
  "/auth/register/buyer",
  "/auth/register/seller",
  "/auth/check-email",
  "/auth/verify-email",
];

const protectedPrefixes = ["/seller", "/buyer", "/admin", "/vendor", "/checkout", "/orders", "/account"];

const getHomeForRole = (role?: string) => {
  if (role === "VENDOR") return "/seller";
  if (role === "ADMIN") return "/admin";
  return "/buyer";
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const role = request.cookies.get("auth_role")?.value;
  const hasSession = Boolean(token || refreshToken);
  const isAuthPage = authPages.includes(pathname);
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/seller") && role && role !== "VENDOR" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && role && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/buyer") && role && role !== "BUYER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/seller/:path*",
    "/buyer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
  ],
};
