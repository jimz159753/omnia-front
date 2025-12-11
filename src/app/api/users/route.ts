import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
      },
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
