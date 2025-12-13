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

    // Create the ticket item
    const ticketItem = await prisma.ticketItem.create({
      data: {
        ticketId,
        productId: productId || null,
        serviceId: serviceId || null,
        quantity: quantity || 1,
        unitPrice: unitPrice || 0,
        total: total || unitPrice || 0,
        discount: discount || 0,
      },
      include: {
        product: true,
        service: true,
      },
    });

    // Update the ticket total
    const ticketItems = await prisma.ticketItem.findMany({
      where: { ticketId },
    });

    const ticketTotal = ticketItems.reduce((sum, item) => sum + item.total, 0);
    const ticketQuantity = ticketItems.reduce((sum, item) => sum + item.quantity, 0);

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

    console.log("DELETE /api/ticket-items - Deleting ticket item:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket item ID is required" },
        { status: 400 }
      );
    }

    // Get the ticket item to find the ticketId
    const ticketItem = await prisma.ticketItem.findUnique({
      where: { id },
    });

    if (!ticketItem) {
      return NextResponse.json(
        { error: "Ticket item not found" },
        { status: 404 }
      );
    }

    // Delete the ticket item
    await prisma.ticketItem.delete({
      where: { id },
    });

    // Update the ticket total
    const ticketItems = await prisma.ticketItem.findMany({
      where: { ticketId: ticketItem.ticketId },
    });

    const ticketTotal = ticketItems.reduce((sum, item) => sum + item.total, 0);
    const ticketQuantity = ticketItems.reduce((sum, item) => sum + item.quantity, 0);

    await prisma.ticket.update({
      where: { id: ticketItem.ticketId },
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
    const { id, quantity, unitPrice, total, discount } = body;

    console.log("PUT /api/ticket-items - Updating ticket item:", id, body);

    if (!id) {
      return NextResponse.json(
        { error: "Ticket item ID is required" },
        { status: 400 }
      );
    }

    // Get the current ticket item
    const ticketItem = await prisma.ticketItem.findUnique({
      where: { id },
    });

    if (!ticketItem) {
      return NextResponse.json(
        { error: "Ticket item not found" },
        { status: 404 }
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
      // Recalculate total based on discount if unitPrice is available
      const finalUnitPrice = unitPrice !== undefined ? unitPrice : ticketItem.unitPrice;
      const discountAmount = (finalUnitPrice * discount) / 100;
      updateData.total = finalUnitPrice - discountAmount;
    }

    // Update the ticket item
    const updatedTicketItem = await prisma.ticketItem.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        service: true,
      },
    });

    // Update the ticket total
    const ticketItems = await prisma.ticketItem.findMany({
      where: { ticketId: ticketItem.ticketId },
    });

    const ticketTotal = ticketItems.reduce((sum, item) => sum + item.total, 0);

    await prisma.ticket.update({
      where: { id: ticketItem.ticketId },
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

