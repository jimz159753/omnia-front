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
            { code: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.inventory.count({ where });

    // Get paginated data
    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: inventory,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, stock, price, categoryId, code, providerCost } =
      body;

    // Validate required fields
    if (
      !name ||
      !description ||
      stock === undefined ||
      price === undefined ||
      !categoryId ||
      !code ||
      providerCost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create inventory item
    const inventory = await prisma.inventory.create({
      data: {
        name,
        description,
        stock: parseInt(stock),
        price: parseFloat(price),
        categoryId,
        code,
        providerCost: parseFloat(providerCost),
      },
      include: {
        category: {
          include: {
            subCategory: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: inventory, message: "Inventory created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
