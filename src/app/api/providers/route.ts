import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ownerName, description } = body;

    if (!name || !ownerName || !description) {
      return NextResponse.json(
        { error: "Name, ownerName and description are required" },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: { name, ownerName, description },
    });

    return NextResponse.json(
      { data: provider, message: "Provider created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

