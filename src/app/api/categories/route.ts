import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await (await getPrisma()).category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await (await getPrisma()).category.create({
      data: { name, description: description || "" },
    });

    return NextResponse.json(
      { data: category, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const category = await (await getPrisma()).category.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json({
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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

    // First delete all subcategories associated with this category
    await (await getPrisma()).subCategory.deleteMany({
      where: { categoryId: id },
    });

    await (await getPrisma()).category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
