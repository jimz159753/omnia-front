import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    const subCategories = await prisma.subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: subCategories });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

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

