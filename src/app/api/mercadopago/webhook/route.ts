import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const dataId = searchParams.get("data.id") || searchParams.get("id");

    if (type === "payment" && dataId) {
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (!accessToken) throw new Error("MP Access Token missing");

      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);
      
      const paymentData = await payment.get({ id: dataId });
      const ticketId = paymentData.external_reference;

      if (ticketId && paymentData.status === "approved") {
        // Update ticket status
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: "Confirmed" },
        });
        
        console.log(`✅ Payment approved for ticket ${ticketId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in Mercado Pago webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
