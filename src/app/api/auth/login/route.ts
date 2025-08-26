import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields", message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Attempt to login
    const result = await auth.login(email, password);

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
