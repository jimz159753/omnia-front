import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createGoogleCalendarEvent,
  GoogleCalendarEvent,
} from "@/services/googleCalendarService";

// Generate random alphanumeric segment
const randomSegment = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Generate unique ticket ID in format TK-YYYY-XXXXXX
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
    // timezoneOffset from getTimezoneOffset() is POSITIVE for behind UTC (e.g., 360 for CST/UTC-6)
    // To convert local time to UTC, we ADD the offset (in absolute value)
    const [hours, minutes] = time.split(":").map(Number);
    
    // Parse the date components
    const [year, month, day] = date.split("-").map(Number);
    
    // Create a date representing the user's local time in UTC format
    const localDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    
    // Convert to actual UTC by adding the timezone offset
    // Example: CST 2:00 PM (offset=360) → UTC 2:00 PM + 6 hours = UTC 8:00 PM
    const startTime = new Date(localDateTime.getTime() + Math.abs(timezoneOffset) * 60000);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    console.log(`📅 Booking: date=${date}, time=${time}, offset=${timezoneOffset}`);
    console.log(`📅 Local representation: ${localDateTime.toISOString()}`);
    console.log(`📅 UTC startTime: ${startTime.toISOString()}`);
    console.log(`📅 UTC endTime: ${endTime.toISOString()}`);

    // Check if slot is still available based on calendar's max slots
    // Two appointments overlap if: appt1.start < appt2.end AND appt1.end > appt2.start
    const existingAppointments = await prisma.ticket.findMany({
      where: {
        startTime: { lt: endTime },  // Appointment starts before new booking ends
        endTime: { gt: startTime },  // Appointment ends after new booking starts
        status: { not: "cancelled" },
      },
    });

    const maxSlots = calendar.slots || 1;
    const overlappingCount = existingAppointments.length;

    console.log(`📊 Slot check: ${overlappingCount}/${maxSlots} appointments at this time`);

    if (overlappingCount >= maxSlots) {
      console.log(`❌ Slot full: ${overlappingCount} existing appointments, max is ${maxSlots}`);
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    console.log(`✅ Slot available: ${overlappingCount}/${maxSlots} booked, creating appointment`);

    // Generate unique ticket ID in format TK-YYYY-XXXXXX
    const ticketId = await generateUniqueTicketId();

    // Create the appointment (ticket)
    const ticket = await prisma.ticket.create({
      data: {
        id: ticketId,
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

    // ✅ SYNC TO GOOGLE CALENDAR
    if (ticket.startTime && ticket.endTime) {
      const googleEvent: GoogleCalendarEvent = {
        summary: `${service.name} - ${client.name}`,
        description: `Booking via ${calendar.name}\nStaff: ${staff.name}\nStatus: pending\nNotes: ${notes || "N/A"}\nPhone: ${client.phone}`,
        start: {
          dateTime: ticket.startTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: ticket.endTime.toISOString(),
          timeZone: "America/Mexico_City",
        },
        // Add client email as attendee
        attendees: client.email && !client.email.includes('@booking.temp') 
          ? [{ email: client.email }] 
          : undefined,
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
        console.log(`📅 Created Google Calendar event: ${googleEventId}`);
      }
    }

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
