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
        { error: "Registration failed", message: "Company not found. Please check the company name." },
        { status: 404 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: "Registration failed", message: "This company account is deactivated." },
        { status: 403 }
      );
    }

    // Ensure the tenant database exists and is migrated before registering
    const { bootstrapTenantDatabase } = await import("@/lib/master-db");
    await bootstrapTenantDatabase(tenantSlug);

    // Attempt to register with tenant context
    const result = await auth.register(email, password, tenantSlug);

    if (!result.success) {
      return NextResponse.json(
        { error: "Registration failed", message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "User created successfully. You can now sign in with your credentials.",
        user: result.user,
        tenantSlug: result.tenantSlug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
