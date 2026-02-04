import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get all booking calendars or a specific one by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (slug) {
      // Get specific calendar by slug (for public access)
      const calendar = await prisma.bookingCalendar.findUnique({
        where: { slug },
        include: {
          services: {
            where: { isEnabled: true },
            include: {
              service: true,
            },
          },
        },
      });

      if (!calendar) {
        return NextResponse.json(
          { error: "Booking calendar not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(calendar);
    }

    if (id) {
      // Get specific calendar by ID (for editing)
      const calendar = await prisma.bookingCalendar.findUnique({
        where: { id },
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      });

      if (!calendar) {
        return NextResponse.json(
          { error: "Booking calendar not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(calendar);
    }

    // Get all calendars
    const calendars = await prisma.bookingCalendar.findMany({
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(calendars);
  } catch (error) {
    console.error("Error fetching booking calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking calendars" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking calendar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      fullName,
      email,
      phone,
      description,
      backgroundImage,
      logoImage,
      primaryColor,
      slots,
      googleCalendarId,
      mercadoPagoEnabled,
      serviceIds,
    } = body;

    // Validate required fields
    if (!name || !fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Name, full name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Generate unique slug from name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists and make it unique
    const existingSlug = await prisma.bookingCalendar.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create the booking calendar
    const calendar = await prisma.bookingCalendar.create({
      data: {
        slug,
        name,
        fullName,
        email,
        phone,
        description: description || null,
        backgroundImage: backgroundImage || null,
        logoImage: logoImage || null,
        primaryColor: primaryColor || "#059669",
        slots: slots || 1,
        googleCalendarId: googleCalendarId || null,
        mercadoPagoEnabled: mercadoPagoEnabled || false,
        services: {
          create:
            serviceIds?.map((serviceId: string) => ({
              serviceId,
              isEnabled: true,
            })) || [],
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Error creating booking calendar:", error);
    return NextResponse.json(
      { error: "Failed to create booking calendar" },
      { status: 500 }
    );
  }
}

// PUT - Update a booking calendar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      fullName,
      email,
      phone,
      description,
      backgroundImage,
      logoImage,
      primaryColor,
      isActive,
      showOnMainPage,
      slots,
      googleCalendarId,
      mercadoPagoEnabled,
      serviceIds,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    // Check if calendar exists
    const existingCalendar = await prisma.bookingCalendar.findUnique({
      where: { id },
    });

    if (!existingCalendar) {
      return NextResponse.json(
        { error: "Booking calendar not found" },
        { status: 404 }
      );
    }

    // If setting showOnMainPage to true, unset it from all other calendars first
    if (showOnMainPage === true) {
      await prisma.bookingCalendar.updateMany({
        where: { id: { not: id }, showOnMainPage: true },
        data: { showOnMainPage: false },
      });
    }

    // Update slug if name changed
    let slug = existingCalendar.slug;
    if (name && name !== existingCalendar.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingSlug = await prisma.bookingCalendar.findFirst({
        where: { slug, id: { not: id } },
      });

      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    // Calculate final slots value - ensure it's a number
    const slotsNumber = slots !== undefined && slots !== "" ? parseInt(String(slots), 10) : null;
    const finalSlots = slotsNumber !== null && !isNaN(slotsNumber) ? slotsNumber : existingCalendar.slots;
    console.log(`📝 Updating calendar "${existingCalendar.name}": slots received=${slots} (type: ${typeof slots}), parsed=${slotsNumber}, existing=${existingCalendar.slots}, final=${finalSlots}`);

    // Update the calendar
    const calendar = await prisma.bookingCalendar.update({
      where: { id },
      data: {
        slug,
        name: name ?? existingCalendar.name,
        fullName: fullName ?? existingCalendar.fullName,
        email: email ?? existingCalendar.email,
        phone: phone ?? existingCalendar.phone,
        description: description !== undefined ? description : existingCalendar.description,
        backgroundImage: backgroundImage !== undefined ? backgroundImage : existingCalendar.backgroundImage,
        logoImage: logoImage !== undefined ? logoImage : existingCalendar.logoImage,
        primaryColor: primaryColor ?? existingCalendar.primaryColor,
        isActive: isActive !== undefined ? isActive : existingCalendar.isActive,
        showOnMainPage: showOnMainPage !== undefined ? showOnMainPage : existingCalendar.showOnMainPage,
        slots: finalSlots,
        googleCalendarId: googleCalendarId !== undefined ? (googleCalendarId || null) : existingCalendar.googleCalendarId,
        mercadoPagoEnabled: mercadoPagoEnabled !== undefined ? mercadoPagoEnabled : existingCalendar.mercadoPagoEnabled,
      },
    });

    console.log(`✅ Calendar updated, slots now: ${calendar.slots}`);

    // Update services if provided
    if (serviceIds !== undefined) {
      // Delete existing services
      await prisma.bookingCalendarService.deleteMany({
        where: { bookingCalendarId: id },
      });

      // Create new services
      if (serviceIds.length > 0) {
        await prisma.bookingCalendarService.createMany({
          data: serviceIds.map((serviceId: string) => ({
            bookingCalendarId: id,
            serviceId,
            isEnabled: true,
          })),
        });
      }
    }

    // Fetch updated calendar with services
    const updatedCalendar = await prisma.bookingCalendar.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCalendar);
  } catch (error) {
    console.error("Error updating booking calendar:", error);
    return NextResponse.json(
      { error: "Failed to update booking calendar" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking calendar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    // Check if calendar exists
    const existingCalendar = await prisma.bookingCalendar.findUnique({
      where: { id },
    });

    if (!existingCalendar) {
      return NextResponse.json(
        { error: "Booking calendar not found" },
        { status: 404 }
      );
    }

    // Delete the calendar (services will be cascade deleted)
    await prisma.bookingCalendar.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Booking calendar deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking calendar:", error);
    return NextResponse.json(
      { error: "Failed to delete booking calendar" },
      { status: 500 }
    );
  }
}
