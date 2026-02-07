import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET() {
  try {
    const prisma = await getPrisma();
    const business = await prisma.business.findFirst({
      select: {
        mercadoPagoAccessToken: true,
        mercadoPagoPublicKey: true,
      },
    });
    return NextResponse.json({ data: business });
  } catch (error) {
    console.error("Mercado Pago GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Mercado Pago settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { accessToken, publicKey } = body;

    const existing = await prisma.business.findFirst();

    if (existing) {
      await prisma.business.update({
        where: { id: existing.id },
        data: {
          mercadoPagoAccessToken: accessToken || null,
          mercadoPagoPublicKey: publicKey || null,
        },
      });
    } else {
      await prisma.business.create({
        data: {
          mercadoPagoAccessToken: accessToken || null,
          mercadoPagoPublicKey: publicKey || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mercado Pago POST error:", error);
    return NextResponse.json(
      { error: "Failed to save Mercado Pago settings" },
      { status: 500 }
    );
  }
}
