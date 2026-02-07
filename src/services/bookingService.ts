import { getPrisma } from "@/lib/db";
import { syncTicketToGoogleCalendar } from "./googleCalendarService";

export interface BookingData {
  serviceId: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  notes?: string | null;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  staffId: string;
  total: number;
  googleCalendarId?: string | null;
  calendarName: string;
}

/**
 * Finalizes a booking by creating the ticket and syncing to Google Calendar.
 * Used after a successful payment.
 */
export async function finalizeBooking(ticketId: string, data: BookingData) {
  const prisma = await getPrisma();
  
  // 1. Idempotency check: See if ticket already exists
  const existing = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { services: true }
  });
  
  if (existing) {
    console.log(`✅ finalizeBooking: Ticket ${ticketId} already exists. Status: ${existing.status}`);
    // If it's already completed, just return
    if (existing.status === "Completed") return existing;
    
    // Otherwise update it to completed
    return await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "Completed" }
    });
  }

  console.log(`🆕 finalizeBooking: Creating new ticket ${ticketId} for ${data.clientName}`);

  // 2. Find or create client
  let client = await prisma.client.findUnique({
    where: { email: data.clientEmail || `${data.clientPhone}@booking.temp` },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: data.clientName,
        email: data.clientEmail || `${data.clientPhone}@booking.temp`,
        phone: data.clientPhone,
      },
    });
  }

  // 3. Create the ticket
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  const ticket = await prisma.ticket.create({
    data: {
      id: ticketId,
      clientId: client.id,
      staffId: data.staffId,
      status: "Completed",
      total: data.total,
      quantity: 1,
      notes: data.notes || `Paid via Mercado Pago - Booked via ${data.calendarName}`,
      startTime,
      endTime,
      duration,
      googleCalendarId: data.googleCalendarId,
      services: {
        create: {
          serviceId: data.serviceId,
          quantity: 1,
          unitPrice: data.total,
          total: data.total,
        },
      },
    },
  });

  // 4. Sync to Google Calendar
  try {
    await syncTicketToGoogleCalendar(ticket.id);
  } catch (err) {
    console.error(`❌ finalizeBooking: Failed to sync to Google Calendar:`, err);
    // We don't fail the whole process if calendar sync fails
  }

  return ticket;
}
