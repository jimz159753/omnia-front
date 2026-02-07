import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { syncTicketToGoogleCalendar } from "@/services/googleCalendarService";
import { finalizeBooking } from "@/services/bookingService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      token, 
      issuer_id, 
      payment_method_id, 
      transaction_amount, 
      installments, 
      payer, 
      ticketId 
    } = body;

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "MP Access Token missing" }, { status: 500 });
    }

    console.log("💳 Processing payment for ticket:", ticketId);
    console.log("💳 Payment details:", { token: token?.substring(0, 10) + "...", payment_method_id, transaction_amount, installments });

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const payerEmail = payer?.email || "guest_user@example.com";

    const paymentBody = {
      token,
      issuer_id: issuer_id ? Number(issuer_id) : undefined,
      payment_method_id,
      transaction_amount: Number(transaction_amount),
      installments: Number(installments),
      payer: {
        email: payerEmail,
        identification: payer?.identification,
      },
      external_reference: ticketId,
      description: `Omnia Booking - ${ticketId}`,
      binary_mode: true,
      metadata: {
        ticket_id: ticketId,
        booking_data: JSON.stringify(body.bookingData),
      }
    };

    console.log("💳 Sending to MP with Unique Idempotency Key");
    console.log("💳 Body:", JSON.stringify(paymentBody, null, 2));

    const result = await payment.create({
      body: paymentBody,
      requestOptions: {
        idempotencyKey: `${ticketId}-${Date.now()}`,
      }
    });

    console.log("💳 MP Result:", result.status, result.status_detail);

    const statusMessages: Record<string, string> = {
      cc_rejected_bad_filled_card_number: "Check the card number.",
      cc_rejected_bad_filled_date: "Check the expiration date.",
      cc_rejected_bad_filled_other: "Check the card details.",
      cc_rejected_bad_filled_security_code: "Check the security code (CVV).",
      cc_rejected_blacklist: "The card is on a blacklist.",
      cc_rejected_call_for_authorize: "You must authorize the payment with your bank.",
      cc_rejected_card_disabled: "The card is disabled. Contact your bank.",
      cc_rejected_card_error: "An error occurred with the card.",
      cc_rejected_duplicated_payment: "This payment was already processed.",
      cc_rejected_high_risk: "The payment was rejected for security reasons.",
      cc_rejected_insufficient_amount: "Insufficient funds.",
      cc_rejected_invalid_installments: "Invalid number of installments.",
      cc_rejected_max_attempts: "Maximum number of attempts reached.",
      cc_rejected_other_reason: "The payment was rejected by the bank. Try another card.",
    };

    if (result.status === "approved") {
      // Create the ticket ONLY after payment is approved
      if (body.bookingData) {
        await finalizeBooking(ticketId, body.bookingData);
        console.log(`✅ Ticket created via finalizeBooking for ${ticketId}`);
      } else {
        // Fallback for cases where bookingData might be missing (direct ticket update)
        await (await getPrisma()).ticket.update({
          where: { id: ticketId },
          data: { status: "Completed" },
        });
        
        // Sync to Google Calendar after payment update
        const { syncTicketToGoogleCalendar } = await import("@/services/googleCalendarService");
        await syncTicketToGoogleCalendar(ticketId);
      }

      return NextResponse.json({ status: "approved", ticketId });
    } else {
      const detail = result.status_detail || "general_rejection";
      const message = statusMessages[detail] || "Your payment was rejected. Please try another card.";
      return NextResponse.json({ 
        error: message,
        status: result.status, 
        detail: result.status_detail,
        id: result.id 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error("❌ MP Processing Error:", error);
    return NextResponse.json(
      { 
        error: "Payment failed", 
        details: error.message || "Unknown error",
        mp_detail: error.response?.data || error
      },
      { status: 400 }
    );
  }
}
