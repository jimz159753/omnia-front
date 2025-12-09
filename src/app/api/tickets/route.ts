import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const randomSegment = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const generateUniqueTicketId = async () => {
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i += 1) {
    const segment = randomSegment(6);
    const id = `TK-${year}-${segment}`;
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) return id;
  }
  throw new Error("Could not generate unique ticket ID");
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
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
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
            service: true,
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
    const {
      clientId,
      sellerId,
      status,
      notes,
      items: incomingItems,
      productId,
      serviceId,
      quantity,
      total,
    } = body;

    if (!clientId || !sellerId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let items: Array<{
      productId?: string;
      serviceId?: string;
      quantity?: number;
      unitPrice?: number;
      total?: number;
    }> = Array.isArray(incomingItems) ? incomingItems : [];

    // Legacy single product/service payload support
    if (!items.length && (productId || serviceId)) {
      items.push({
        productId,
        serviceId,
        quantity: quantity ? Number(quantity) : 1,
        total: total ? Number(total) : undefined,
      });
    }

    // Validate items
    items = items.filter((i) => i);
    if (!items.length) {
      return NextResponse.json(
        { error: "At least one item (product or service) is required" },
        { status: 400 }
      );
    }

    const productIds = Array.from(
      new Set(items.map((i) => i.productId).filter(Boolean))
    ) as string[];
    const serviceIds = Array.from(
      new Set(items.map((i) => i.serviceId).filter(Boolean))
    ) as string[];

    const [productsMap, servicesMap] = await Promise.all([
      (async () => {
        if (!productIds.length) return new Map<string, number>();
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, cost: true },
        });
        return new Map(products.map((p) => [p.id, p.cost]));
      })(),
      (async () => {
        if (!serviceIds.length) return new Map<string, number>();
        const services = await prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, price: true },
        });
        return new Map(services.map((s) => [s.id, s.price]));
      })(),
    ]);

    let totalQuantity = 0;
    let computedTotal = 0;
    const productQuantityMap = new Map<string, number>();
    const itemData = items.map((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      totalQuantity += qty;
      const inferredUnit =
        item.unitPrice ??
        (item.productId ? productsMap.get(item.productId) : undefined) ??
        (item.serviceId ? servicesMap.get(item.serviceId) : undefined) ??
        0;
      const lineTotal =
        item.total !== undefined
          ? Number(item.total)
          : (inferredUnit ?? 0) * qty;
      computedTotal += lineTotal;
      if (item.productId) {
        const prev = productQuantityMap.get(item.productId) || 0;
        productQuantityMap.set(item.productId, prev + qty);
      }
      return {
        productId: item.productId || null,
        serviceId: item.serviceId || null,
        quantity: qty,
        unitPrice: inferredUnit ?? 0,
        total: lineTotal,
      };
    });

    const ticketId = await generateUniqueTicketId();

    const ticket = await prisma.$transaction(async (tx) => {
      if (productQuantityMap.size > 0) {
        const ids = Array.from(productQuantityMap.keys());
        const products = await tx.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, stock: true },
        });
        const stockMap = new Map(products.map((p) => [p.id, p.stock]));
        for (const id of ids) {
          const need = productQuantityMap.get(id) || 0;
          const available = stockMap.get(id);
          if (available === undefined) {
            throw new Error("Invalid product in ticket items");
          }
          if (available < need) {
            throw new Error("Insufficient stock for one or more products");
          }
        }
        await Promise.all(
          ids.map((id) =>
            tx.product.update({
              where: { id },
              data: { stock: { decrement: productQuantityMap.get(id) || 0 } },
            })
          )
        );
      }

      return tx.ticket.create({
        data: {
          id: ticketId,
          clientId,
          sellerId,
          quantity: totalQuantity,
          total: computedTotal,
          status,
          notes: notes || "",
          items: {
            create: itemData,
          },
        },
        include: {
          client: true,
          seller: {
            select: {
              id: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
              service: true,
            },
          },
        },
      });
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

