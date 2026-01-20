import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarEvent,
} from "@/services/googleCalendarService";

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
    const id = searchParams.get("id");

    // If ID is provided, fetch single ticket with items
    if (id) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          client: true,
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { error: "Ticket not found" },
          { status: 404 }
        );
      }

      // Transform the data to match the expected format
      const transformedTicket = {
        ...ticket,
        items: [
          ...ticket.products.map((tp) => ({
            id: tp.id,
            quantity: tp.quantity,
            unitPrice: tp.unitPrice,
            total: tp.total,
            discount: tp.discount,
            product: tp.product,
            service: null,
            type: "product" as const,
          })),
          ...ticket.services.map((ts) => ({
            id: ts.id,
            quantity: ts.quantity,
            unitPrice: ts.unitPrice,
            total: ts.total,
            discount: ts.discount,
            product: null,
            service: ts.service,
            type: "service" as const,
          })),
        ],
      };

      // Remove the products and services arrays
      const {
        products: _,
        services: __,
        ...ticketWithoutArrays
      } = transformedTicket;

      return NextResponse.json({ data: ticketWithoutArrays });
    }

    // Otherwise, fetch paginated list
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const dateFilter = searchParams.get("dateFilter") || "all";
    const specificDate = searchParams.get("specificDate") || "";
    const startDate = searchParams.get("startDate") || "";

    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Build the where clause with proper AND/OR logic
    const conditions: any[] = [];

    if (search) {
      conditions.push({
        OR: [
          {
            client: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            products: {
              some: {
                product: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
          {
            services: {
              some: {
                service: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
          { status: { contains: search, mode: "insensitive" as const } },
        ],
      });
    }

    if (status && status !== "all") {
      conditions.push({ status });
    }

    // Date filtering
    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let filterStartDate: Date;
      let filterEndDate: Date;

      if (dateFilter === "today") {
        filterStartDate = new Date(now.setHours(0, 0, 0, 0));
        filterEndDate = new Date(now.setHours(23, 59, 59, 999));
      } else if (dateFilter === "thisMonth") {
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (dateFilter === "calendar" && specificDate) {
        const selectedDate = new Date(specificDate);
        filterStartDate = new Date(selectedDate.setHours(0, 0, 0, 0));
        filterEndDate = new Date(selectedDate.setHours(23, 59, 59, 999));
      } else if (dateFilter === "custom" && startDate) {
        filterStartDate = new Date(startDate);
        filterEndDate = new Date();
      } else {
        filterStartDate = new Date(0);
        filterEndDate = new Date();
      }

      conditions.push({
        createdAt: {
          gte: filterStartDate,
          lte: filterEndDate,
        },
      });
    }

    // If we have conditions, combine them with AND
    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const total = await prisma.ticket.count({ where });

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        client: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        services: {
          include: {
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

    // Transform the data to match the expected format
    const transformedTickets = tickets.map((ticket) => ({
      ...ticket,
      items: [
        ...ticket.products.map((tp) => ({
          id: tp.id,
          quantity: tp.quantity,
          unitPrice: tp.unitPrice,
          total: tp.total,
          discount: tp.discount,
          product: tp.product,
          service: null,
          type: "product" as const,
        })),
        ...ticket.services.map((ts) => ({
          id: ts.id,
          quantity: ts.quantity,
          unitPrice: ts.unitPrice,
          total: ts.total,
          discount: ts.discount,
          product: null,
          service: ts.service,
          type: "service" as const,
        })),
      ],
      products: undefined,
      services: undefined,
    }));

    return NextResponse.json({
      data: transformedTickets,
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
      staffId,
      status,
      notes,
      items: incomingItems,
      productId,
      serviceId,
      quantity,
      total,
      startTime,
      endTime,
      duration,
    } = body;

    if (!clientId || !staffId || !status) {
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
      discount?: number;
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
    const productItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
      discount?: number;
    }> = [];
    const serviceItems: Array<{
      serviceId: string;
      quantity: number;
      unitPrice: number;
      total: number;
      discount?: number;
    }> = [];

    items.forEach((item) => {
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
        productItems.push({
          productId: item.productId,
          quantity: qty,
          unitPrice: inferredUnit ?? 0,
          total: lineTotal,
          discount: item.discount || 0,
        });
      } else if (item.serviceId) {
        serviceItems.push({
          serviceId: item.serviceId,
          quantity: qty,
          unitPrice: inferredUnit ?? 0,
          total: lineTotal,
          discount: item.discount || 0,
        });
      }
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

      // Use provided duration or calculate from start/end times
      let durationInMinutes: number | null = null;
      if (duration !== undefined && duration !== null) {
        durationInMinutes = parseInt(duration.toString());
      } else if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        durationInMinutes = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60)
        );
      }

      return tx.ticket.create({
        data: {
          id: ticketId,
          clientId,
          staffId,
          quantity: totalQuantity,
          total: computedTotal,
          status,
          notes: notes || "",
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          duration: durationInMinutes,
          ...(productItems.length > 0 && {
            products: {
              create: productItems,
            },
          }),
          ...(serviceItems.length > 0 && {
            services: {
              create: serviceItems,
            },
          }),
        },
        include: {
          client: true,
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          products: {
            include: {
              product: true,
            },
          },
          services: {
            include: {
              service: true,
            },
          },
        },
      });
    });

    // Transform the response to match expected format
    const transformedTicket = {
      ...ticket,
      items: [
        ...ticket.products.map((tp) => ({
          id: tp.id,
          quantity: tp.quantity,
          unitPrice: tp.unitPrice,
          total: tp.total,
          discount: tp.discount,
          product: tp.product,
          service: null,
          type: "product" as const,
        })),
        ...ticket.services.map((ts) => ({
          id: ts.id,
          quantity: ts.quantity,
          unitPrice: ts.unitPrice,
          total: ts.total,
          discount: ts.discount,
          product: null,
          service: ts.service,
          type: "service" as const,
        })),
      ],
    };

    const {
      products: _,
      services: __,
      ...ticketWithoutArrays
    } = transformedTicket;

    // ✅ SYNC TO GOOGLE CALENDAR (only if appointment)
    if (ticket.startTime && ticket.endTime) {
      const service = ticket.services[0]?.service;
      const serviceName = service?.name || "Appointment";
      const clientName = ticket.client?.name || "Client";
      const staffName = ticket.staff?.name || "Staff";

      const googleEvent: GoogleCalendarEvent = {
        summary: `${serviceName} - ${clientName}`,
        description: `Staff: ${staffName}\nStatus: ${ticket.status}\nNotes: ${ticket.notes || "N/A"}`,
        start: {
          dateTime: ticket.startTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: ticket.endTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        // Don't add attendees for service accounts (requires Domain-Wide Delegation)
        // Client info is in the description instead
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 }, // 30 min before
          ],
        },
      };

      const googleEventId = await createGoogleCalendarEvent(googleEvent);

      // Save the Google Calendar event ID to the ticket
      if (googleEventId) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { googleCalendarEventId: googleEventId },
        });
        // Add to response
        ticketWithoutArrays.googleCalendarEventId = googleEventId;
      }
    }

    return NextResponse.json(
      { data: ticketWithoutArrays, message: "Ticket created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket:", error);

    // Return specific error messages for known issues
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      startTime,
      endTime,
      staffId,
      clientId,
      notes,
      items,
      quantity,
      total,
      duration,
      status,
    } = body;

    console.log("PUT /api/tickets - Updating ticket:", id, body);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: {
      startTime?: Date | null;
      endTime?: Date | null;
      duration?: number | null;
      staffId?: string;
      clientId?: string;
      notes?: string;
      quantity?: number;
      total?: number;
      status?: string;
    } = {};

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (startTime !== undefined) {
      startDate = startTime ? new Date(startTime) : null;
      updateData.startTime = startDate;
    }
    if (endTime !== undefined) {
      endDate = endTime ? new Date(endTime) : null;
      updateData.endTime = endDate;
    }
    if (staffId) {
      updateData.staffId = staffId;
    }
    if (clientId) {
      updateData.clientId = clientId;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (total !== undefined) {
      updateData.total = total;
    }
    if (duration !== undefined) {
      updateData.duration = duration;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Calculate duration if both times are being updated
    if (
      startTime !== undefined &&
      endTime !== undefined &&
      startDate &&
      endDate
    ) {
      const durationInMinutes = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      );
      updateData.duration = durationInMinutes;
    } else if (startTime !== undefined || endTime !== undefined) {
      // If only one time is updated, fetch the ticket to calculate with the existing time
      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
        select: { startTime: true, endTime: true },
      });

      if (existingTicket) {
        const finalStartTime = startDate || existingTicket.startTime;
        const finalEndTime = endDate || existingTicket.endTime;

        if (finalStartTime && finalEndTime) {
          const durationInMinutes = Math.round(
            (finalEndTime.getTime() - finalStartTime.getTime()) / (1000 * 60)
          );
          updateData.duration = durationInMinutes;
        }
      }
    }

    // Handle items update if provided
    if (items && Array.isArray(items)) {
      // Delete existing items from both tables
      await Promise.all([
        prisma.ticketProduct.deleteMany({ where: { ticketId: id } }),
        prisma.ticketService.deleteMany({ where: { ticketId: id } }),
      ]);

      // Create new items
      for (const item of items) {
        if (item.productId) {
          await prisma.ticketProduct.create({
            data: {
              ticketId: id,
              productId: item.productId,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: item.total || 0,
              discount: item.discount || 0,
            },
          });
        } else if (item.serviceId) {
          await prisma.ticketService.create({
            data: {
              ticketId: id,
              serviceId: item.serviceId,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
              total: item.total || 0,
              discount: item.discount || 0,
            },
          });
        }
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    // Transform the response to match expected format
    const transformedTicket = {
      ...updatedTicket,
      items: [
        ...updatedTicket.products.map((tp) => ({
          id: tp.id,
          quantity: tp.quantity,
          unitPrice: tp.unitPrice,
          total: tp.total,
          discount: tp.discount,
          product: tp.product,
          service: null,
          type: "product" as const,
        })),
        ...updatedTicket.services.map((ts) => ({
          id: ts.id,
          quantity: ts.quantity,
          unitPrice: ts.unitPrice,
          total: ts.total,
          discount: ts.discount,
          product: null,
          service: ts.service,
          type: "service" as const,
        })),
      ],
    };

    const {
      products: _,
      services: __,
      ...ticketWithoutArrays
    } = transformedTicket;

    // ✅ SYNC TO GOOGLE CALENDAR (only if appointment)
    if (updatedTicket.startTime && updatedTicket.endTime) {
      const service = updatedTicket.services[0]?.service;
      const serviceName = service?.name || "Appointment";
      const clientName = updatedTicket.client?.name || "Client";
      const staffName = updatedTicket.staff?.name || "Staff";

      const googleEvent: GoogleCalendarEvent = {
        summary: `${serviceName} - ${clientName}`,
        description: `Staff: ${staffName}\nStatus: ${updatedTicket.status}\nNotes: ${updatedTicket.notes || "N/A"}`,
        start: {
          dateTime: updatedTicket.startTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: updatedTicket.endTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        // Don't add attendees for service accounts (requires Domain-Wide Delegation)
        // Client info is in the description instead
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 }, // 30 min before
          ],
        },
      };

      if (updatedTicket.googleCalendarEventId) {
        // Update existing event
        await updateGoogleCalendarEvent(
          updatedTicket.googleCalendarEventId,
          googleEvent
        );
      } else {
        // Create new event if it doesn't exist
        const googleEventId = await createGoogleCalendarEvent(googleEvent);
        if (googleEventId) {
          await prisma.ticket.update({
            where: { id: updatedTicket.id },
            data: { googleCalendarEventId: googleEventId },
          });
          ticketWithoutArrays.googleCalendarEventId = googleEventId;
        }
      }
    }

    return NextResponse.json(
      { data: ticketWithoutArrays, message: "Ticket updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ticket:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Get ticket to retrieve Google Calendar event ID
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { googleCalendarEventId: true },
    });

    // First delete related ticket products and services
    await Promise.all([
      prisma.ticketProduct.deleteMany({ where: { ticketId: id } }),
      prisma.ticketService.deleteMany({ where: { ticketId: id } }),
    ]);

    // Then delete the ticket
    await prisma.ticket.delete({
      where: { id },
    });

    // ✅ DELETE FROM GOOGLE CALENDAR
    if (ticket?.googleCalendarEventId) {
      await deleteGoogleCalendarEvent(ticket.googleCalendarEventId);
    }

    return NextResponse.json(
      { message: "Ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ticket:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
