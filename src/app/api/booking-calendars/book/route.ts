import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST - Create a booking/appointment from public booking page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      serviceId,
      date,
      time,
      timezoneOffset = 0, // Timezone offset in minutes (negative for ahead of UTC)
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = body;

    // Validate required fields
    if (!slug || !serviceId || !date || !time || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the booking calendar
    const calendar = await prisma.bookingCalendar.findUnique({
      where: { slug },
      include: {
        services: {
          where: { serviceId, isEnabled: true },
          include: { service: true },
        },
      },
    });

    if (!calendar || !calendar.isActive) {
      return NextResponse.json(
        { error: "Booking calendar not found or inactive" },
        { status: 404 }
      );
    }

    const calendarService = calendar.services[0];
    if (!calendarService) {
      return NextResponse.json(
        { error: "Service not available in this calendar" },
        { status: 404 }
      );
    }

    const service = calendarService.service;

    // Find or create client
    let client = await prisma.client.findUnique({
      where: { email: clientEmail || `${clientPhone}@booking.temp` },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail || `${clientPhone}@booking.temp`,
          phone: clientPhone,
        },
      });
    }

    // Get a default staff member (first user)
    const staff = await prisma.user.findFirst({
      where: { isActive: true },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "No staff available to handle booking" },
        { status: 500 }
      );
    }

    // Parse date and time with timezone consideration
    // Date format: "2026-01-23", Time format: "14:00"
    // timezoneOffset is in minutes (e.g., -360 for CST/Mexico City which is UTC-6)
    const [hours, minutes] = time.split(":").map(Number);
    
    // Parse the date components
    const [year, month, day] = date.split("-").map(Number);
    
    // Create a date in UTC, then adjust for the user's timezone
    // If user is in CST (UTC-6), offset is -360 minutes
    // We need to ADD the offset to get UTC time
    const localDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    
    // Adjust for timezone: if offset is -360 (CST), we add 360 minutes (6 hours) to get UTC
    const startTime = new Date(localDateTime.getTime() + timezoneOffset * 60000);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    console.log(`📅 Booking: date=${date}, time=${time}, offset=${timezoneOffset}`);
    console.log(`📅 Local time: ${localDateTime.toISOString()}`);
    console.log(`📅 Adjusted startTime (UTC): ${startTime.toISOString()}`);
    console.log(`📅 Adjusted endTime (UTC): ${endTime.toISOString()}`);

    // Check if slot is still available
    const existingAppointment = await prisma.ticket.findFirst({
      where: {
        startTime: { lte: endTime },
        endTime: { gte: startTime },
        status: { not: "cancelled" },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Create the appointment (ticket)
    const ticket = await prisma.ticket.create({
      data: {
        clientId: client.id,
        staffId: staff.id,
        status: "pending",
        total: service.price,
        quantity: 1,
        notes: notes || `Booked via ${calendar.name}`,
        startTime,
        endTime,
        duration: service.duration,
        services: {
          create: {
            serviceId: service.id,
            quantity: 1,
            unitPrice: service.price,
            total: service.price,
          },
        },
      },
      include: {
        client: true,
        staff: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: ticket.id,
          service: service.name,
          date: startTime.toISOString(),
          time,
          duration: service.duration,
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone,
          },
        },
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        error: "Failed to create booking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
