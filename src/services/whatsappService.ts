import twilio from "twilio";

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials not configured");
    return null;
  }

  return twilio(accountSid, authToken);
};

// WhatsApp phone number from Twilio (format: whatsapp:+14155238886)
const getWhatsAppNumber = () => {
  const number = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!number) {
    console.warn("Twilio WhatsApp number not configured");
    return null;
  }
  // Ensure proper format
  return number.startsWith("whatsapp:") ? number : `whatsapp:${number}`;
};

export interface WhatsAppMessageData {
  to: string; // Client phone number
  message: string;
  // Optional template variables for personalization
  variables?: {
    clientName?: string;
    date?: string;
    time?: string;
    serviceName?: string;
    businessName?: string;
    staffName?: string;
  };
}

/**
 * Replace template variables in message
 */
export const parseMessageTemplate = (
  template: string,
  variables: WhatsAppMessageData["variables"]
): string => {
  if (!variables) return template;

  let message = template;
  
  if (variables.clientName) {
    message = message.replace(/{clientName}/g, variables.clientName);
  }
  if (variables.date) {
    message = message.replace(/{date}/g, variables.date);
  }
  if (variables.time) {
    message = message.replace(/{time}/g, variables.time);
  }
  if (variables.serviceName) {
    message = message.replace(/{serviceName}/g, variables.serviceName);
  }
  if (variables.businessName) {
    message = message.replace(/{businessName}/g, variables.businessName);
  }
  if (variables.staffName) {
    message = message.replace(/{staffName}/g, variables.staffName);
  }

  return message;
};

/**
 * Format phone number for WhatsApp
 * Accepts: +521234567890, 1234567890, etc.
 * Returns: whatsapp:+521234567890
 */
export const formatWhatsAppNumber = (phone: string): string => {
  // Remove any non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    // Assume Mexico country code if no country code provided
    cleaned = `+52${cleaned}`;
  }
  
  return `whatsapp:${cleaned}`;
};

/**
 * Send a WhatsApp message
 */
export const sendWhatsAppMessage = async (
  data: WhatsAppMessageData
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const client = getTwilioClient();
    const fromNumber = getWhatsAppNumber();

    if (!client) {
      return {
        success: false,
        error: "WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
      };
    }

    if (!fromNumber) {
      return {
        success: false,
        error: "WhatsApp number not configured. Please set TWILIO_WHATSAPP_NUMBER.",
      };
    }

    const toNumber = formatWhatsAppNumber(data.to);
    const messageBody = data.variables
      ? parseMessageTemplate(data.message, data.variables)
      : data.message;

    console.log(`📱 Sending WhatsApp message to ${toNumber}`);

    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber,
    });

    console.log(`✅ WhatsApp message sent: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
};

/**
 * Send bulk WhatsApp messages
 */
export const sendBulkWhatsAppMessages = async (
  messages: WhatsAppMessageData[]
): Promise<{ sent: number; failed: number; results: Array<{ to: string; success: boolean; error?: string }> }> => {
  const results: Array<{ to: string; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (const msg of messages) {
    const result = await sendWhatsAppMessage(msg);
    results.push({
      to: msg.to,
      success: result.success,
      error: result.error,
    });

    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { sent, failed, results };
};

/**
 * Check if WhatsApp service is configured
 */
export const isWhatsAppConfigured = (): boolean => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  );
};

/**
 * Get WhatsApp configuration status
 */
export const getWhatsAppStatus = (): {
  configured: boolean;
  hasAccountSid: boolean;
  hasAuthToken: boolean;
  hasWhatsAppNumber: boolean;
} => {
  return {
    configured: isWhatsAppConfigured(),
    hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
    hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
    hasWhatsAppNumber: !!process.env.TWILIO_WHATSAPP_NUMBER,
  };
};
