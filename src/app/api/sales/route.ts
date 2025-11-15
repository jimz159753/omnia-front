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
            { client: { contains: search, mode: "insensitive" as const } },
            { code: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { seller: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.sale.count({ where });

    // Get paginated data
    const sales = await prisma.sale.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: sales,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      client,
      code,
      description,
      units,
      unitPrice,
      totalPrice,
      hasDiscount,
      discountPercentage,
      finalPrice,
      cardPayment,
      realIncome,
      paymentStatus,
      paymentMethod,
      account,
      seller,
      category,
      subCategory,
      provider,
      providerCost,
      providerPaymentStatus,
      comments,
    } = body;

    // Validate required fields
    if (
      !date ||
      !client ||
      !code ||
      !description ||
      units === undefined ||
      unitPrice === undefined ||
      totalPrice === undefined ||
      finalPrice === undefined ||
      realIncome === undefined ||
      !paymentStatus ||
      !paymentMethod ||
      !account ||
      !seller ||
      !category ||
      !provider ||
      providerCost === undefined ||
      !providerPaymentStatus
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        date: new Date(date),
        client,
        code,
        description,
        units: parseInt(units),
        unitPrice: parseFloat(unitPrice),
        totalPrice: parseFloat(totalPrice),
        hasDiscount: hasDiscount || false,
        discountPercentage: discountPercentage
          ? parseFloat(discountPercentage)
          : null,
        finalPrice: parseFloat(finalPrice),
        cardPayment: cardPayment || false,
        realIncome: parseFloat(realIncome),
        paymentStatus,
        paymentMethod,
        account,
        seller,
        category,
        subCategory: subCategory || null,
        provider,
        providerCost: parseFloat(providerCost),
        providerPaymentStatus,
        comments: comments || null,
      },
    });

    return NextResponse.json(
      { data: sale, message: "Sale created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      date,
      client,
      code,
      description,
      units,
      unitPrice,
      totalPrice,
      hasDiscount,
      discountPercentage,
      finalPrice,
      cardPayment,
      realIncome,
      paymentStatus,
      paymentMethod,
      account,
      seller,
      category,
      subCategory,
      provider,
      providerCost,
      providerPaymentStatus,
      comments,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Update sale
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        client,
        code,
        description,
        units: units ? parseInt(units) : undefined,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
        hasDiscount,
        discountPercentage: discountPercentage
          ? parseFloat(discountPercentage)
          : undefined,
        finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
        cardPayment,
        realIncome: realIncome ? parseFloat(realIncome) : undefined,
        paymentStatus,
        paymentMethod,
        account,
        seller,
        category,
        subCategory,
        provider,
        providerCost: providerCost ? parseFloat(providerCost) : undefined,
        providerPaymentStatus,
        comments,
      },
    });

    return NextResponse.json(
      { data: sale, message: "Sale updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Sale ID is required" },
        { status: 400 }
      );
    }

    // Check if sale exists
    const existingSale = await prisma.sale.findUnique({
      where: { id },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Delete sale
    await prisma.sale.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Sale deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
