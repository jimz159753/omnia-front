import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getPrisma } from "@/lib/db";

const uploadDirectory = path.join(process.cwd(), "public", "uploads");

async function saveAvatar(avatarFile: File | null) {
  if (!avatarFile || avatarFile.size === 0) return null;
  await fs.promises.mkdir(uploadDirectory, { recursive: true });
  const buffer = Buffer.from(await avatarFile.arrayBuffer());
  const safeName = `${Date.now()}-${avatarFile.name.replace(
    /[^a-zA-Z0-9._-]/g,
    ""
  )}`;
  const filePath = path.join(uploadDirectory, safeName);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${safeName}`;
}

export async function GET() {
  try {
    // TODO: Get user ID from session/auth
    // For now, getting the first user
    const user = await (await getPrisma()).user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Get account error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch account details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // TODO: Get user ID from session/auth
    // For now, getting the first user
    const existing = await (await getPrisma()).user.findFirst();
    
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const avatarFile =
      formData.get("avatar") instanceof File
        ? (formData.get("avatar") as File)
        : null;

    const data: { name?: string; email?: string; avatar?: string } = {};
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    
    if (name) data.name = name;
    if (email) data.email = email;

    let avatarUrl = existing.avatar ?? null;
    if (avatarFile && avatarFile.size > 0) {
      const savedAvatar = await saveAvatar(avatarFile);
      if (savedAvatar) {
        avatarUrl = savedAvatar;
      }
      if (existing.avatar && existing.avatar !== avatarUrl) {
        const oldPath = path.join(process.cwd(), "public", existing.avatar);
        fs.promises.rm(oldPath).catch(() => {});
      }
    }

    if (avatarUrl) {
      data.avatar = avatarUrl;
    }

    const user = await (await getPrisma()).user.update({
      where: { id: existing.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json(
      {
        error: "Failed to update account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

