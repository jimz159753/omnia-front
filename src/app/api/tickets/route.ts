import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            {
              client: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              product: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            {
              service: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            { status: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const total = await prisma.ticket.count({ where });

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: true,
        product: true,
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      data: tickets,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, productId, serviceId, sellerId, amount, status, notes } = body;

    if (
      !clientId ||
      !sellerId ||
      amount === undefined ||
      !status ||
      (!productId && !serviceId)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ticketId = `TK-${new Date().getFullYear()}-${randomUUID()}`;

    const ticket = await prisma.ticket.create({
      data: {
        id: ticketId,
        clientId,
        productId: productId || null,
        serviceId: serviceId || null,
        sellerId,
        amount: parseFloat(amount),
        status,
        notes: notes || "",
      },
      include: {
        client: true,
        product: true,
        service: true,
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { data: ticket, message: "Ticket created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

