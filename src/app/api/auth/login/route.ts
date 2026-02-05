import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { masterPrisma } from "@/lib/master-db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantSlug } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields", message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!tenantSlug) {
      return NextResponse.json(
        { error: "Missing fields", message: "Company is required" },
        { status: 400 }
      );
    }

    // Verify the tenant exists in master database
    const account = await masterPrisma.account.findUnique({
      where: { slug: tenantSlug },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Login failed", message: "Company not found. Please check the company name." },
        { status: 404 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: "Login failed", message: "This company account is deactivated." },
        { status: 403 }
      );
    }

    // Attempt to login with tenant context
    const result = await auth.login(email, password, tenantSlug);

    if (!result.success) {
      return NextResponse.json(
        { error: "Login failed", message: result.error },
        { status: 401 }
      );
    }

    // Set HTTP-only cookie with the session token
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: result.user,
        tenantSlug: result.tenantSlug,
      },
      { status: 200 }
    );

    // Set secure cookie (in production, add httpOnly: true, secure: true)
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
