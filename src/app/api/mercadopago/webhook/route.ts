import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { syncTicketToGoogleCalendar } from "@/services/googleCalendarService";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const dataId = searchParams.get("data.id") || searchParams.get("id");

    if (type === "payment" && dataId) {
      const business = await (await getPrisma()).business.findFirst({
        select: { mercadoPagoAccessToken: true }
      });
      
      const accessToken = business?.mercadoPagoAccessToken;
      
      if (!accessToken) throw new Error("MP Access Token missing");

      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);
      
      const paymentData = await payment.get({ id: dataId });
      const ticketId = paymentData.external_reference as string;
      const metadata = (paymentData as any).metadata;
      const bookingDataRaw = metadata?.booking_data;

      if (ticketId && paymentData.status === "approved") {
        if (bookingDataRaw) {
          const { finalizeBooking } = await import("@/services/bookingService");
          const bookingData = JSON.parse(bookingDataRaw);
          await finalizeBooking(ticketId, bookingData);
          console.log(`✅ Ticket created via webhook finalizeBooking for ${ticketId}`);
        } else {
          // Fallback update for existing tickets
          await (await getPrisma()).ticket.update({
            where: { id: ticketId },
            data: { status: "Completed" },
          });
          
          // Sync to Google Calendar after payment
          await syncTicketToGoogleCalendar(ticketId);
        }
        
        console.log(`✅ Payment approved for ticket ${ticketId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in Mercado Pago webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
