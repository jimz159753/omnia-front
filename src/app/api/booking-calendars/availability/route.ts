import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get availability for a booking calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date"); // Format: YYYY-MM-DD
    const timezoneOffset = parseInt(searchParams.get("timezoneOffset") || "0"); // User's timezone offset in minutes

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

      // Get existing appointments for this day
      // The user selected a date in their local timezone, we need to convert to UTC
      // getTimezoneOffset() returns positive for behind UTC (e.g., 360 for UTC-6)
      // To convert local to UTC, we ADD the offset
      // Example: CST (UTC-6) offset=360, Jan 23 00:00 local = Jan 23 00:00 + 6 hours = Jan 23 06:00 UTC
      const localMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const dayStart = new Date(localMidnight.getTime() + Math.abs(timezoneOffset) * 60000);
      const localEndOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
      const dayEnd = new Date(localEndOfDay.getTime() + Math.abs(timezoneOffset) * 60000);

      console.log(`🔍 Checking appointments for ${date} (offset: ${timezoneOffset} min)`);
      console.log(`📅 Day range (UTC): ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);

      // Find appointments that overlap with this day
      // An appointment overlaps if: appointment.start < dayEnd AND appointment.end > dayStart
      const existingAppointments = await prisma.ticket.findMany({
        where: {
          startTime: { lt: dayEnd },
          endTime: { gt: dayStart },
          status: { not: "cancelled" },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });

      console.log(`📋 Found ${existingAppointments.length} appointments:`, 
        existingAppointments.map(a => ({ 
          start: a.startTime?.toISOString(), 
          end: a.endTime?.toISOString() 
        }))
      );

      // Get max slots from calendar (ensure it's at least 1)
      const maxSlots = calendar.slots && calendar.slots > 0 ? calendar.slots : 1;
      console.log(`🔢 Calendar "${calendar.name}" has maxSlots: ${maxSlots} (from DB: ${calendar.slots})`);

      // Calculate available slots
      const slots = calculateAvailableSlots(
        daySchedule.startTime!,
        daySchedule.endTime!,
        service.duration,
        existingAppointments,
        restTimes.filter(
          (rt) => rt.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
        ),
        dayStart, // Pass the UTC day start
        timezoneOffset, // Pass timezone offset
        maxSlots // Pass max concurrent slots allowed
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
  restTimes: Array<{ startTime: string; endTime: string }>,
  dayStartUTC: Date, // The UTC start of the day
  timezoneOffset: number, // Timezone offset in minutes
  maxSlots: number = 1 // Maximum concurrent appointments allowed
): Array<{ time: string; available: boolean; remainingSlots?: number }> {
  const slots: Array<{ time: string; available: boolean; remainingSlots?: number }> = [];

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

    // Create Date objects for this slot
    // Start from dayStartUTC and add the minutes into the day
    const slotStartDate = new Date(dayStartUTC.getTime() + minutes * 60000);
    const slotEndDate = new Date(slotStartDate.getTime() + serviceDuration * 60000);

    // Count how many appointments overlap with this slot
    let overlappingCount = 0;

    for (const appointment of existingAppointments) {
      if (appointment.startTime && appointment.endTime) {
        // Both are Date objects in UTC, compare directly
        // Slot overlaps if: slot.start < appt.end AND slot.end > appt.start
        if (slotStartDate < appointment.endTime && slotEndDate > appointment.startTime) {
          overlappingCount++;
        }
      }
    }

    // Check if slot is available (still has remaining slots)
    // Important: overlappingCount must be LESS THAN maxSlots for slot to be available
    let isAvailable = overlappingCount < maxSlots;
    const remainingSlots = Math.max(0, maxSlots - overlappingCount);

    // Log for debugging when there are overlapping appointments
    if (overlappingCount > 0) {
      console.log(`📊 Slot ${slotTime}: overlapping=${overlappingCount}, maxSlots=${maxSlots}, available=${isAvailable}, remaining=${remainingSlots}`);
    }

    // Check if slot conflicts with rest times (rest times always block all slots)
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

    slots.push({ time: slotTime, available: isAvailable, remainingSlots: isAvailable ? remainingSlots : 0 });
  }

  return slots;
}
