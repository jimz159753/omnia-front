import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
};

// GET - Get message history from Twilio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const direction = searchParams.get("direction") || "outbound-api";

    const client = getTwilioClient();

    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Twilio credentials not configured",
        messages: [],
        total: 0,
        stats: {},
      });
    }

    // Build filter options
    const filterOptions: {
      limit: number;
      from?: string;
      to?: string;
    } = {
      limit,
    };

    // Filter by WhatsApp number (outgoing messages)
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (whatsappNumber) {
      filterOptions.from = whatsappNumber.startsWith("whatsapp:")
        ? whatsappNumber
        : `whatsapp:${whatsappNumber}`;
    }

    // Fetch messages from Twilio
    const messageList = await client.messages.list(filterOptions);

    // Filter by status if provided
    let filteredMessages = messageList;
    if (status) {
      filteredMessages = messageList.filter((msg) => msg.status === status);
    }

    // Transform messages
    const messages = filteredMessages.map((msg) => ({
      id: msg.sid,
      sid: msg.sid,
      recipientPhone: msg.to.replace("whatsapp:", ""),
      recipientName: null, // Twilio doesn't store names
      messageType: "manual", // Default type
      status: msg.status,
      body: msg.body,
      bodyPreview: msg.body?.substring(0, 100) + (msg.body && msg.body.length > 100 ? "..." : ""),
      direction: msg.direction,
      price: msg.price,
      priceUnit: msg.priceUnit,
      errorCode: msg.errorCode,
      errorMessage: msg.errorMessage,
      dateSent: msg.dateSent,
      dateCreated: msg.dateCreated,
      dateUpdated: msg.dateUpdated,
    }));

    // Calculate stats
    const stats: Record<string, number> = {};
    messageList.forEach((msg) => {
      stats[msg.status] = (stats[msg.status] || 0) + 1;
    });

    // Calculate total cost
    const totalCost = messageList.reduce((sum, msg) => {
      const price = typeof msg.price === 'string' ? parseFloat(msg.price) : (msg.price || 0);
      return sum + price;
    }, 0);

    return NextResponse.json({
      configured: true,
      messages,
      total: messageList.length,
      stats,
      totalCost: Math.abs(totalCost),
      currency: messageList[0]?.priceUnit || "USD",
    });
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch messages", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// POST - Send a new message and log it
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Phone number (to) and message are required" },
        { status: 400 }
      );
    }

    const client = getTwilioClient();
    if (!client) {
      return NextResponse.json(
        { error: "Twilio not configured" },
        { status: 503 }
      );
    }

    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    const fromNumber = whatsappNumber?.startsWith("whatsapp:")
      ? whatsappNumber
      : `whatsapp:${whatsappNumber}`;

    // Format recipient number
    let toNumber = to.replace(/[^\d+]/g, "");
    if (!toNumber.startsWith("+")) {
      toNumber = `+52${toNumber}`;
    }
    toNumber = `whatsapp:${toNumber}`;

    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });

    return NextResponse.json({
      success: true,
      message: {
        sid: twilioMessage.sid,
        status: twilioMessage.status,
        to: twilioMessage.to,
        from: twilioMessage.from,
        dateCreated: twilioMessage.dateCreated,
      },
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { 
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
