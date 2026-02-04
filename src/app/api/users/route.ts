import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { Resend } from "resend";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        position: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const position = formData.get("position") as string;
    const isActive = formData.get("isActive") === "true";
    const avatarData = formData.get("avatar") as string;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    let hashedPassword = null;
    let invitationToken = null;
    let invitationExpires = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Generate invite token
      invitationToken = crypto.randomBytes(32).toString("hex");
      invitationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    }

    // Handle avatar upload
    let avatarPath = null;
    if (avatarData && avatarData.startsWith("data:image")) {
      const matches = avatarData.match(/^data:image\/(\w+);base64,/);
      const imageType = matches ? matches[1] : "jpg";
      const base64Data = avatarData.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${Date.now()}-avatar.${imageType}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      avatarPath = `/uploads/${fileName}`;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user",
        position: position || "",
        isActive,
        avatar: avatarPath,
        invitationToken,
        invitationExpires,
      },
    });

    // Send Invitation Email if token generated and user is active
    if (invitationToken && isActive) {
      try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          const inviteUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/invite?token=${invitationToken}`;
          // Try to get company name although not available here directly without DB call, use variable or default
          const businessName = "Espacio Omnia"; 
          const businessEmail = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";
          
          await resend.emails.send({
            from: businessEmail,
            to: email,
            subject: `Welcome to ${businessName} - Complete your registration`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h2 style="color: #4b5563;">Welcome to ${businessName}!</h2>
                <p style="color: #374151;">Hello <strong>${name}</strong>,</p>
                <p style="color: #374151;">You have been invited to join the team dashboard.</p>
                <p style="color: #374151;">Please click the button below to set your password and access your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Set Password & Login</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This link expires in 48 hours.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // We do not fail the request if email fails, but we log it
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        position: user.position,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const position = formData.get("position") as string;
    const isActive = formData.get("isActive") === "true";
    const avatarData = formData.get("avatar") as string;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      email,
      role: role || "user",
      position: position || "",
      isActive,
    };

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle avatar upload
    if (avatarData && avatarData.startsWith("data:image")) {
      const matches = avatarData.match(/^data:image\/(\w+);base64,/);
      const imageType = matches ? matches[1] : "jpg";
      const base64Data = avatarData.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${Date.now()}-avatar.${imageType}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      updateData.avatar = `/uploads/${fileName}`;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        position: user.position,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
