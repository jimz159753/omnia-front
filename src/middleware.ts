import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get the auth token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // Check if the request is for a protected route
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/users");

  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If token exists, allow the request to continue
    return NextResponse.next();
  }

  // For non-protected routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/users/:path*",
    // Add other protected routes here
  ],
};
