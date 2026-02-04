import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // TODO: Get user ID from session/auth
    // For now, getting the first user
    const user = await (await getPrisma()).user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { error: "Password not set for this user." },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await (await getPrisma()).user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      {
        error: "Failed to change password",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

