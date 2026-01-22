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

// GET - Get Twilio account balance and usage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get("messages") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const client = getTwilioClient();

    if (!client) {
      return NextResponse.json({
        configured: false,
        error: "Twilio credentials not configured",
        balance: null,
        currency: null,
        messagesSent: 0,
        messagesThisMonth: 0,
        messages: [],
      });
    }

    // Fetch account balance
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    let balance = null;
    let currency = "USD";

    try {
      const balanceData = await client.balance.fetch();
      balance = parseFloat(balanceData.balance);
      currency = balanceData.currency;
    } catch (balanceError) {
      console.error("Error fetching Twilio balance:", balanceError);
    }

    // Fetch WhatsApp messages count
    let messagesSent = 0;
    let messagesThisMonth = 0;
    const messages: Array<{
      sid: string;
      to: string;
      from: string;
      body: string;
      status: string;
      direction: string;
      price: string | null;
      priceUnit: string | null;
      dateSent: Date | null;
      dateCreated: Date;
    }> = [];

    try {
      // Get this month's start date
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      thisMonthStart.setHours(0, 0, 0, 0);

      // Fetch recent WhatsApp messages
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      const fromNumber = whatsappNumber?.startsWith("whatsapp:")
        ? whatsappNumber
        : `whatsapp:${whatsappNumber}`;

      const messageList = await client.messages.list({
        from: fromNumber,
        limit: includeMessages ? limit : 100,
      });

      messagesSent = messageList.length;

      // Count messages this month
      messagesThisMonth = messageList.filter(
        (msg) => msg.dateCreated >= thisMonthStart
      ).length;

      // Include message details if requested
      if (includeMessages) {
        messages.push(
          ...messageList.map((msg) => ({
            sid: msg.sid,
            to: msg.to,
            from: msg.from,
            body: msg.body?.substring(0, 100) + (msg.body && msg.body.length > 100 ? "..." : ""),
            status: msg.status,
            direction: msg.direction,
            price: msg.price,
            priceUnit: msg.priceUnit,
            dateSent: msg.dateSent,
            dateCreated: msg.dateCreated,
          }))
        );
      }
    } catch (messagesError) {
      console.error("Error fetching Twilio messages:", messagesError);
    }

    // Fetch usage records for more detailed stats
    let totalCost = 0;

    try {
      // Get this month's usage
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      
      const usage = await client.usage.records.list({
        category: "sms-outbound",
        startDate: thisMonthStart,
        limit: 10,
      });

      // Calculate total cost this month
      totalCost = usage.reduce((sum, record) => {
        const price = typeof record.price === 'string' ? parseFloat(record.price) : (record.price || 0);
        return sum + price;
      }, 0);
    } catch (usageError) {
      console.error("Error fetching Twilio usage:", usageError);
    }

    return NextResponse.json({
      configured: true,
      balance,
      currency,
      messagesSent,
      messagesThisMonth,
      totalCostThisMonth: totalCost,
      messages: includeMessages ? messages : undefined,
    });
  } catch (error) {
    console.error("Error fetching WhatsApp credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - This endpoint is kept for potential future use (e.g., logging custom transactions)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // For now, just return Twilio account info
    // In a real app, you might use this to top up account via Twilio's API
    if (action === "refresh") {
      const client = getTwilioClient();
      if (!client) {
        return NextResponse.json(
          { error: "Twilio not configured" },
          { status: 503 }
        );
      }

      const balanceData = await client.balance.fetch();
      return NextResponse.json({
        success: true,
        balance: parseFloat(balanceData.balance),
        currency: balanceData.currency,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in credits POST:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
