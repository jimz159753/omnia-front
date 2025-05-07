import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get("token");
  if (request.nextUrl.pathname.includes("/dashboard")) {
    if (jwt === undefined) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}