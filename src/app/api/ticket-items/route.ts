import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, productId, serviceId, quantity, unitPrice, total, discount } = body;

    console.log("POST /api/ticket-items - Creating ticket item:", body);

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    if (!productId && !serviceId) {
      return NextResponse.json(
        { error: "Either productId or serviceId is required" },
        { status: 400 }
      );
    }

    let ticketItem;

    // Create either a TicketProduct or TicketService
    if (productId) {
      ticketItem = await prisma.ticketProduct.create({
        data: {
          ticketId,
          productId,
          quantity: quantity || 1,
          unitPrice: unitPrice || 0,
          total: total || unitPrice || 0,
          discount: discount || 0,
        },
        include: {
          product: true,
        },
      });
    } else {
      ticketItem = await prisma.ticketService.create({
        data: {
          ticketId,
          serviceId: serviceId!,
          quantity: quantity || 1,
          unitPrice: unitPrice || 0,
          total: total || unitPrice || 0,
          discount: discount || 0,
        },
        include: {
          service: true,
        },
      });
    }

    // Update the ticket total
    const [ticketProducts, ticketServices] = await Promise.all([
      prisma.ticketProduct.findMany({ where: { ticketId } }),
      prisma.ticketService.findMany({ where: { ticketId } }),
    ]);

    const ticketTotal =
      ticketProducts.reduce((sum, item) => sum + item.total, 0) +
      ticketServices.reduce((sum, item) => sum + item.total, 0);

    const ticketQuantity =
      ticketProducts.reduce((sum, item) => sum + item.quantity, 0) +
      ticketServices.reduce((sum, item) => sum + item.quantity, 0);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        total: ticketTotal,
        quantity: ticketQuantity,
      },
    });

    return NextResponse.json(
      { data: ticketItem, message: "Ticket item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ticket item:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create ticket item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // 'product' or 'service'

    console.log("DELETE /api/ticket-items - Deleting ticket item:", id, type);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket item ID is required" },
        { status: 400 }
      );
    }

    let ticketId: string;

    // Try to find and delete from both tables
    if (type === "product") {
      const ticketProduct = await prisma.ticketProduct.findUnique({
        where: { id },
      });

      if (!ticketProduct) {
        return NextResponse.json(
          { error: "Ticket item not found" },
          { status: 404 }
        );
      }

      ticketId = ticketProduct.ticketId;
      await prisma.ticketProduct.delete({ where: { id } });
    } else if (type === "service") {
      const ticketService = await prisma.ticketService.findUnique({
        where: { id },
      });

      if (!ticketService) {
        return NextResponse.json(
          { error: "Ticket item not found" },
          { status: 404 }
        );
      }

      ticketId = ticketService.ticketId;
      await prisma.ticketService.delete({ where: { id } });
    } else {
      // Try both if type is not specified
      const ticketProduct = await prisma.ticketProduct.findUnique({
        where: { id },
      });

      if (ticketProduct) {
        ticketId = ticketProduct.ticketId;
        await prisma.ticketProduct.delete({ where: { id } });
      } else {
        const ticketService = await prisma.ticketService.findUnique({
          where: { id },
        });

        if (!ticketService) {
          return NextResponse.json(
            { error: "Ticket item not found" },
            { status: 404 }
          );
        }

        ticketId = ticketService.ticketId;
        await prisma.ticketService.delete({ where: { id } });
      }
    }

    // Update the ticket total
    const [ticketProducts, ticketServices] = await Promise.all([
      prisma.ticketProduct.findMany({ where: { ticketId } }),
      prisma.ticketService.findMany({ where: { ticketId } }),
    ]);

    const ticketTotal =
      ticketProducts.reduce((sum, item) => sum + item.total, 0) +
      ticketServices.reduce((sum, item) => sum + item.total, 0);

    const ticketQuantity =
      ticketProducts.reduce((sum, item) => sum + item.quantity, 0) +
      ticketServices.reduce((sum, item) => sum + item.quantity, 0);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        total: ticketTotal,
        quantity: ticketQuantity,
      },
    });

    return NextResponse.json(
      { message: "Ticket item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting ticket item:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to delete ticket item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity, unitPrice, total, discount, type } = body;

    console.log("PUT /api/ticket-items - Updating ticket item:", id, body);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket item ID is required" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      quantity?: number;
      unitPrice?: number;
      total?: number;
      discount?: number;
    } = {};

    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (unitPrice !== undefined) {
      updateData.unitPrice = unitPrice;
    }
    if (total !== undefined) {
      updateData.total = total;
    }
    if (discount !== undefined) {
      updateData.discount = discount;
    }

    let updatedTicketItem;
    let ticketId: string;

    // Try to find and update from both tables
    if (type === "product") {
      const ticketProduct = await prisma.ticketProduct.findUnique({
        where: { id },
      });

      if (!ticketProduct) {
        return NextResponse.json(
          { error: "Ticket item not found" },
          { status: 404 }
        );
      }

      ticketId = ticketProduct.ticketId;

      // Recalculate total based on discount if needed
      if (discount !== undefined) {
        const finalUnitPrice =
          unitPrice !== undefined ? unitPrice : ticketProduct.unitPrice;
        const discountAmount = (finalUnitPrice * discount) / 100;
        updateData.total = finalUnitPrice - discountAmount;
      }

      updatedTicketItem = await prisma.ticketProduct.update({
        where: { id },
        data: updateData,
        include: {
          product: true,
        },
      });
    } else if (type === "service") {
      const ticketService = await prisma.ticketService.findUnique({
        where: { id },
      });

      if (!ticketService) {
        return NextResponse.json(
          { error: "Ticket item not found" },
          { status: 404 }
        );
      }

      ticketId = ticketService.ticketId;

      // Recalculate total based on discount if needed
      if (discount !== undefined) {
        const finalUnitPrice =
          unitPrice !== undefined ? unitPrice : ticketService.unitPrice;
        const discountAmount = (finalUnitPrice * discount) / 100;
        updateData.total = finalUnitPrice - discountAmount;
      }

      updatedTicketItem = await prisma.ticketService.update({
        where: { id },
        data: updateData,
        include: {
          service: true,
        },
      });
    } else {
      // Try both if type is not specified
      const ticketProduct = await prisma.ticketProduct.findUnique({
        where: { id },
      });

      if (ticketProduct) {
        ticketId = ticketProduct.ticketId;

        // Recalculate total based on discount if needed
        if (discount !== undefined) {
          const finalUnitPrice =
            unitPrice !== undefined ? unitPrice : ticketProduct.unitPrice;
          const discountAmount = (finalUnitPrice * discount) / 100;
          updateData.total = finalUnitPrice - discountAmount;
        }

        updatedTicketItem = await prisma.ticketProduct.update({
          where: { id },
          data: updateData,
          include: {
            product: true,
          },
        });
      } else {
        const ticketService = await prisma.ticketService.findUnique({
          where: { id },
        });

        if (!ticketService) {
          return NextResponse.json(
            { error: "Ticket item not found" },
            { status: 404 }
          );
        }

        ticketId = ticketService.ticketId;

        // Recalculate total based on discount if needed
        if (discount !== undefined) {
          const finalUnitPrice =
            unitPrice !== undefined ? unitPrice : ticketService.unitPrice;
          const discountAmount = (finalUnitPrice * discount) / 100;
          updateData.total = finalUnitPrice - discountAmount;
        }

        updatedTicketItem = await prisma.ticketService.update({
          where: { id },
          data: updateData,
          include: {
            service: true,
          },
        });
      }
    }

    // Update the ticket total
    const [ticketProducts, ticketServices] = await Promise.all([
      prisma.ticketProduct.findMany({ where: { ticketId } }),
      prisma.ticketService.findMany({ where: { ticketId } }),
    ]);

    const ticketTotal =
      ticketProducts.reduce((sum, item) => sum + item.total, 0) +
      ticketServices.reduce((sum, item) => sum + item.total, 0);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        total: ticketTotal,
      },
    });

    return NextResponse.json(
      { data: updatedTicketItem, message: "Ticket item updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ticket item:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to update ticket item" },
      { status: 500 }
    );
  }
}
