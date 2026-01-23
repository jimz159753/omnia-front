import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get availability for a booking calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!slug) {
      return NextResponse.json(
        { error: "Calendar slug is required" },
        { status: 400 }
      );
    }

    // Get the booking calendar
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

    if (!calendar || !calendar.isActive) {
      return NextResponse.json(
        { error: "Booking calendar not found or inactive" },
        { status: 404 }
      );
    }

    // Get business schedules
    const schedules = await prisma.schedule.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    // Get rest times
    const restTimes = await prisma.restTime.findMany();

    // If a specific date is requested, calculate available time slots
    if (date && serviceId) {
      const service = calendar.services.find(
        (s) => s.serviceId === serviceId
      )?.service;

      if (!service) {
        return NextResponse.json(
          { error: "Service not found in this calendar" },
          { status: 404 }
        );
      }

      // Parse date correctly to avoid timezone issues
      const [year, month, day] = date.split("-").map(Number);
      const requestedDate = new Date(year, month - 1, day);
      const dayOfWeek = requestedDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      // Get schedule for this day
      const daySchedule = schedules.find(
        (s) => s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (!daySchedule || !daySchedule.isOpen) {
        return NextResponse.json({
          date,
          dayOfWeek,
          isOpen: false,
          slots: [],
          message: "Business is closed on this day",
        });
      }

      // Get existing appointments for this day (using consistent date parsing)
      const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
      const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

      const existingAppointments = await prisma.ticket.findMany({
        where: {
          startTime: { gte: dayStart },
          endTime: { lte: dayEnd },
          status: { not: "cancelled" },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

      // Calculate available slots
      const slots = calculateAvailableSlots(
        daySchedule.startTime!,
        daySchedule.endTime!,
        service.duration,
        existingAppointments,
        restTimes.filter(
          (rt) => rt.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
        )
      );

      return NextResponse.json({
        date,
        dayOfWeek,
        isOpen: true,
        slots,
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price,
        },
      });
    }

    // Return calendar info with schedules
    return NextResponse.json({
      calendar: {
        id: calendar.id,
        name: calendar.name,
        fullName: calendar.fullName,
        description: calendar.description,
        backgroundImage: calendar.backgroundImage,
        logoImage: calendar.logoImage,
        primaryColor: calendar.primaryColor,
      },
      services: calendar.services.map((s) => ({
        id: s.service.id,
        name: s.service.name,
        duration: s.service.duration,
        price: s.service.price,
        description: s.service.description,
        image: s.service.image,
      })),
      schedules: schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        isOpen: s.isOpen,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

function calculateAvailableSlots(
  startTime: string,
  endTime: string,
  serviceDuration: number,
  existingAppointments: Array<{ startTime: Date | null; endTime: Date | null }>,
  restTimes: Array<{ startTime: string; endTime: string }>
): Array<{ time: string; available: boolean }> {
  const slots: Array<{ time: string; available: boolean }> = [];

  // Parse start and end times
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Generate 30-minute slots
  for (let minutes = startMinutes; minutes + serviceDuration <= endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const slotTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    const slotEnd = minutes + serviceDuration;

    // Check if slot conflicts with existing appointments
    let isAvailable = true;

    for (const appointment of existingAppointments) {
      if (appointment.startTime && appointment.endTime) {
        const apptStartMinutes =
          appointment.startTime.getHours() * 60 + appointment.startTime.getMinutes();
        const apptEndMinutes =
          appointment.endTime.getHours() * 60 + appointment.endTime.getMinutes();

        // Check for overlap
        if (minutes < apptEndMinutes && slotEnd > apptStartMinutes) {
          isAvailable = false;
          break;
        }
      }
    }

    // Check if slot conflicts with rest times
    for (const rest of restTimes) {
      const [restStartHour, restStartMin] = rest.startTime.split(":").map(Number);
      const [restEndHour, restEndMin] = rest.endTime.split(":").map(Number);
      const restStartMinutes = restStartHour * 60 + restStartMin;
      const restEndMinutes = restEndHour * 60 + restEndMin;

      if (minutes < restEndMinutes && slotEnd > restStartMinutes) {
        isAvailable = false;
        break;
      }
    }

    slots.push({ time: slotTime, available: isAvailable });
  }

  return slots;
}
