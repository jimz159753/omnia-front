import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  parseMessageTemplate,
  isWhatsAppConfigured,
  getWhatsAppStatus,
} from "@/services/whatsappService";
import { getPrisma } from "@/lib/db";

// POST - Send a WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, templateType, variables } = body;

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: "Phone number (to) is required" },
        { status: 400 }
      );
    }

    if (!message && !templateType) {
      return NextResponse.json(
        { error: "Either message or templateType is required" },
        { status: 400 }
      );
    }

    // Check if WhatsApp is configured
    if (!isWhatsAppConfigured()) {
      const status = getWhatsAppStatus();
      return NextResponse.json(
        {
          error: "WhatsApp service not configured",
          details: {
            hasAccountSid: status.hasAccountSid,
            hasAuthToken: status.hasAuthToken,
            hasWhatsAppNumber: status.hasWhatsAppNumber,
          },
        },
        { status: 503 }
      );
    }

    let finalMessage = message;

    // If templateType is provided, fetch the template from database
    if (templateType) {
      const reminder = await (await getPrisma()).whatsAppReminder.findUnique({
        where: { type: templateType },
      });

      if (!reminder) {
        return NextResponse.json(
          { error: `Template type '${templateType}' not found` },
          { status: 404 }
        );
      }

      finalMessage = reminder.messageTemplate;
    }

    // Parse template variables if provided
    if (variables) {
      finalMessage = parseMessageTemplate(finalMessage, variables);
    }

    // Send the message
    const result = await sendWhatsAppMessage({
      to,
      message: finalMessage,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: "WhatsApp message sent successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send message" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in WhatsApp send API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Check WhatsApp configuration status
export async function GET() {
  try {
    const status = getWhatsAppStatus();
    return NextResponse.json({
      configured: status.configured,
      status: status,
    });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json(
      { error: "Failed to check WhatsApp status" },
      { status: 500 }
    );
  }
}
