import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  isWhatsAppConfigured,
  getWhatsAppStatus,
} from "@/services/whatsappService";

// POST - Send a test WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if WhatsApp is configured
    if (!isWhatsAppConfigured()) {
      const status = getWhatsAppStatus();
      return NextResponse.json(
        {
          error: "WhatsApp service not configured",
          configured: false,
          details: status,
        },
        { status: 503 }
      );
    }

    // Send test message
    const testMessage = `🧪 *Mensaje de Prueba*

¡Hola! Este es un mensaje de prueba desde Espacio Omnia.

Si recibes este mensaje, la configuración de WhatsApp está funcionando correctamente. ✅

_Enviado automáticamente_`;

    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      message: testMessage,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "Test message sent successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test message",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test WhatsApp message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
