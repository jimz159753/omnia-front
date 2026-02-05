import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    const user = await (await getPrisma()).user.findFirst({
      where: {
        invitationToken: token,
        invitationExpires: {
          gt: new Date(),
        },
      },
      select: { name: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ valid: false, error: "Invalid or expired invitation token" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password, tenantSlug } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find user with token
    const prisma = await getPrisma();
    const user = await prisma.user.findFirst({
      where: {
        invitationToken: token,
        invitationExpires: {
          gt: new Date(), // Expires > Now
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired invitation token" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        invitationToken: null,
        invitationExpires: null,
        isActive: true, // Activate user
      },
    });

    // Auto-login logic (with tenant context)
    const jwtToken = auth.createToken(user.id, user.email, tenantSlug || "dev");

    const response = NextResponse.json({
        success: true,
        message: "Account setup successfully"
    });

    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Invite completion error:", error);
    return NextResponse.json(
      { error: "Failed to set password" },
      { status: 500 }
    );
  }
}
