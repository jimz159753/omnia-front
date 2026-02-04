import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const hostname = request.headers.get("host") || "";
  
  // --- Tenant Logic ---
  let tenant = "dev";
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
  requestHeaders.set("x-tenant-slug", tenant);

  // --- Auth Logic ---
  const token = request.cookies.get("auth-token")?.value;
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
