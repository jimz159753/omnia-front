import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getPrisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, serviceName, price, clientEmail } = body;

    const business = await (await getPrisma()).business.findFirst({
      select: { mercadoPagoAccessToken: true }
    });
    
    const accessToken = business?.mercadoPagoAccessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago access token not configured" },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken: accessToken,
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: ticketId,
            title: serviceName,
            quantity: 1,
            unit_price: Number(price),
            currency_id: "MXN",
          },
        ],
        payer: {
          email: clientEmail,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book/status?status=success&ticketId=${ticketId}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book/status?status=failure&ticketId=${ticketId}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/book/status?status=pending&ticketId=${ticketId}`,
        },
        auto_return: "approved",
        external_reference: ticketId,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mercadopago/webhook`,
      },
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json(
      { error: "Failed to create payment preference" },
      { status: 500 }
    );
  }
}
