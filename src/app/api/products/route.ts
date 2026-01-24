import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
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
            subCategories: true,
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
      minStock,
      price,
      categoryId,
      subCategoryId,
      providerId,
      sku,
      cost,
      image = "",
    } = body;

    // Validate required fields
    if (
      !name ||
      stock === undefined ||
      price === undefined ||
      !providerId ||
      cost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields: name, stock, price, provider, cost" },
        { status: 400 }
      );
    }

    // Validate provider (required)
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json(
        { error: "Invalid provider. Please select an existing provider." },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category. Please select an existing category." },
          { status: 400 }
        );
      }
    }

    // Validate subcategory if provided
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });
      if (!subCategory) {
        return NextResponse.json(
          { error: "Invalid subcategory. Please select an existing subcategory." },
          { status: 400 }
        );
      }
      if (categoryId && subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          {
            error:
              "Invalid subcategory. Ensure it belongs to the selected category.",
          },
          { status: 400 }
        );
      }
    }

    const parsedStock = Number.parseInt(stock);
    const parsedMinStock = minStock !== undefined ? Number.parseInt(minStock) : 0;
    const parsedPrice = Number.parseFloat(price);
    const parsedCost = Number.parseFloat(cost);

    if (
      Number.isNaN(parsedStock) ||
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedCost) ||
      Number.isNaN(parsedMinStock)
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values for stock, minStock, price, or cost" },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        stock: parsedStock,
        minStock: parsedMinStock,
        price: parsedPrice,
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        providerId,
        sku: sku || "",
        cost: parsedCost,
        image,
      },
      include: {
        category: {
          include: {
            subCategories: true,
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
      minStock,
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const parsedStock = stock !== undefined ? Number.parseInt(stock) : undefined;
    const parsedMinStock = minStock !== undefined ? Number.parseInt(minStock) : undefined;
    const parsedPrice = price !== undefined ? Number.parseFloat(price) : undefined;
    const parsedCost = cost !== undefined ? Number.parseFloat(cost) : undefined;

    if (
      (parsedStock !== undefined && Number.isNaN(parsedStock)) ||
      (parsedMinStock !== undefined && Number.isNaN(parsedMinStock)) ||
      (parsedPrice !== undefined && Number.isNaN(parsedPrice)) ||
      (parsedCost !== undefined && Number.isNaN(parsedCost))
    ) {
      return NextResponse.json(
        { error: "Invalid numeric values for stock, minStock, price, or cost" },
        { status: 400 }
      );
    }

    // Validate provider if provided (required field)
    if (providerId) {
      const provider = await prisma.provider.findUnique({ where: { id: providerId } });
      if (!provider) {
        return NextResponse.json(
          { error: "Invalid provider. Please select an existing provider." },
          { status: 400 }
        );
      }
    }

    // Validate category if provided (optional)
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category. Please select an existing category." },
          { status: 400 }
        );
      }
    }

    // Validate subcategory if provided (optional)
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });
      if (!subCategory) {
        return NextResponse.json(
          { error: "Invalid subcategory. Please select an existing subcategory." },
          { status: 400 }
        );
      }
      if (categoryId && subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          {
            error:
              "Invalid subcategory. Ensure it belongs to the selected category.",
          },
          { status: 400 }
        );
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || "",
        stock: parsedStock,
        minStock: parsedMinStock,
        price: parsedPrice,
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        providerId,
        sku: sku || "",
        cost: parsedCost,
        image,
      },
      include: {
        category: {
          include: {
            subCategories: true,
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
