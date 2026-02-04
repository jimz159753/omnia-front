import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    const subCategories = await (await getPrisma()).subCategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and categoryId are required" },
        { status: 400 }
      );
    }

    const subCategory = await (await getPrisma()).subCategory.create({
      data: { name, description: description || "", categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, categoryId } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const subCategory = await (await getPrisma()).subCategory.update({
      where: { id },
      data: { name, description, categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: subCategory,
      message: "SubCategory updated successfully",
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await (await getPrisma()).subCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "SubCategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}