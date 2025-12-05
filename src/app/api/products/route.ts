import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get paginated data
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
        provider: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      stock,
      price,
      categoryId,
      subCategoryId,
      providerId,
      sku,
      cost,
      image = "",
    } = body;

    // Validate required fields for schema constraints
    if (
      !name ||
      !description ||
      stock === undefined ||
      price === undefined ||
      !categoryId ||
      !subCategoryId ||
      !providerId ||
      !sku ||
      cost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate foreign keys before attempting create
    const [category, subCategory, provider] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.subCategory.findUnique({ where: { id: subCategoryId } }),
      prisma.provider.findUnique({ where: { id: providerId } }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category. Please select an existing category." },
        { status: 400 }
      );
    }

    if (!subCategory || subCategory.categoryId !== categoryId) {
      return NextResponse.json(
        {
          error:
            "Invalid subcategory. Ensure it exists and belongs to the selected category.",
        },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: "Invalid provider. Please select an existing provider." },
        { status: 400 }
      );
    }

    const parsedStock = Number.parseInt(stock);
    const parsedPrice = Number.parseFloat(price);
    const parsedCost = Number.parseFloat(cost);

    if (
      Number.isNaN(parsedStock) ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedCost)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values for stock, price, or cost" },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        stock: parsedStock,
        price: parsedPrice,
        categoryId,
        subCategoryId,
        providerId,
        sku,
        cost: parsedCost,
        image,
      },
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
        provider: true,
      },
    });

    return NextResponse.json(
      { data: product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create product: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      stock,
      price,
      categoryId,
      subCategoryId,
      providerId,
      sku,
      cost,
      image = "",
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (
      !name ||
      !description ||
      stock === undefined ||
      price === undefined ||
      !categoryId ||
      !subCategoryId ||
      !providerId ||
      !sku ||
      cost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parsedStock = Number.parseInt(stock);
    const parsedPrice = Number.parseFloat(price);
    const parsedCost = Number.parseFloat(cost);

    if (
      Number.isNaN(parsedStock) ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedCost)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values for stock, price, or cost" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate foreign keys before update
    const [category, subCategory, provider] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.subCategory.findUnique({ where: { id: subCategoryId } }),
      prisma.provider.findUnique({ where: { id: providerId } }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category. Please select an existing category." },
        { status: 400 }
      );
    }

    if (!subCategory || subCategory.categoryId !== categoryId) {
      return NextResponse.json(
        {
          error:
            "Invalid subcategory. Ensure it exists and belongs to the selected category.",
        },
        { status: 400 }
      );
    }

    if (!provider) {
      return NextResponse.json(
        { error: "Invalid provider. Please select an existing provider." },
        { status: 400 }
      );
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        stock: parsedStock,
        price: parsedPrice,
        categoryId,
        subCategoryId,
        providerId,
        sku,
        cost: parsedCost,
        image,
      },
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
        provider: true,
      },
    });

    return NextResponse.json(
      { data: product, message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to update product: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
