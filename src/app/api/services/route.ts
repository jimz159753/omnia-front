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
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.service.count({ where });

    // Get paginated data
    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: services,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
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
      price,
      commission,
      duration,
      categoryId,
      subCategoryId,
      image,
    } = body;

    // Validate required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      commission === undefined ||
      duration === undefined ||
      !categoryId ||
      !subCategoryId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category. Please select an existing category." },
        { status: 400 }
      );
    }

    // Validate that subcategory exists and belongs to the category
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!subCategory) {
      return NextResponse.json(
        { error: "Invalid subcategory. Please select an existing subcategory." },
        { status: 400 }
      );
    }
    if (subCategory.categoryId !== categoryId) {
      return NextResponse.json(
        {
          error:
            "The selected subcategory does not belong to the selected category.",
        },
        { status: 400 }
      );
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        commission: parseFloat(commission),
        duration: parseInt(duration),
        categoryId,
        subCategoryId,
        image: image || "",
      },
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
      },
    });

    return NextResponse.json(
      { data: service, message: "Service created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create service", details: errorMessage },
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
      price,
      commission,
      duration,
      categoryId,
      subCategoryId,
      image,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category. Please select an existing category." },
          { status: 400 }
        );
      }
    }

    // Validate subcategory if provided
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategory) {
        return NextResponse.json(
          {
            error: "Invalid subcategory. Please select an existing subcategory.",
          },
          { status: 400 }
        );
      }
      if (categoryId && subCategory.categoryId !== categoryId) {
        return NextResponse.json(
          {
            error:
              "The selected subcategory does not belong to the selected category.",
          },
          { status: 400 }
        );
      }
    }

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        commission: commission !== undefined ? parseFloat(commission) : undefined,
        duration: duration !== undefined ? parseInt(duration) : undefined,
        categoryId,
        subCategoryId,
        image,
      },
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
        subCategory: true,
      },
    });

    return NextResponse.json(
      { data: service, message: "Service updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating service:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update service", details: errorMessage },
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
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete service
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Service deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}

