import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, categoryId } = body;

    if (!name || !description || !categoryId) {
      return NextResponse.json(
        { error: "Name, description and categoryId are required" },
        { status: 400 }
      );
    }

    const subCategory = await prisma.subCategory.create({
      data: { name, description, categoryId },
    });

    return NextResponse.json(
      { data: subCategory, message: "SubCategory created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}

