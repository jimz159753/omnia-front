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

    // Attempt to register
    const result = await auth.register(email, password);

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
