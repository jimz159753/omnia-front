import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          message: "No authentication token found",
        },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const user = await auth.getUserByToken(token);

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid token",
          message: "Authentication token is invalid or expired",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Authentication check failed",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
