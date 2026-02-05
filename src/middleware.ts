import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const hostname = request.headers.get("host") || "";
  
  // --- Tenant Logic (Identity-based SaaS) ---
  let tenant = "dev";
  const token = request.cookies.get("auth-token")?.value;

  if (token) {
    try {
      // Decode JWT without verification to get tenant info (stateless resolution)
      // Since jsonwebtoken doesn't work in Edge Runtime, we do a simple base64 decode of the payload
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.tenantSlug) {
          tenant = payload.tenantSlug;
        }
      }
    } catch (e) {
      // If token is malformed, fallback to default (API routes will handle 401)
    }
  }
  
  // If no token, we can still allow subdomain for development/legacy support
  if (tenant === "dev") {
    const domain = hostname.split(":")[0];
    const parts = domain.split(".");
    
    if (domain.endsWith("localhost")) {
        if (parts.length > 1 && parts[0] !== "www") {
            tenant = parts[0];
        }
    } else {
        if (parts.length > 2 && parts[0] !== "www") {
            tenant = parts[0];
        }
    }
  }

  requestHeaders.set("x-tenant-slug", tenant);

  // --- Auth Logic ---
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/users");

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Apply to all routes excluding static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
