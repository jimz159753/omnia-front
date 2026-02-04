import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getPrisma } from "@/lib/db";

// Initialize Resend with API key
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

interface TicketItem {
  quantity: number;
  unitPrice: number;
  total: number;
  product?: { name: string } | null;
  service?: { name: string } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, recipientEmail, customMessage } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    // Fetch ticket details with all related data
    const ticket = await (await getPrisma()).ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Determine recipient email
    const toEmail = recipientEmail || ticket.client?.email;
    if (!toEmail) {
      return NextResponse.json(
        { error: "No recipient email found. Please provide an email address or ensure the client has an email on file." },
        { status: 400 }
      );
    }

    // Fetch business info for branding
    const business = await (await getPrisma()).business.findFirst();
    const businessName = business?.name || "Espacio Omnia";
    const businessEmail = process.env.RESEND_FROM_EMAIL || "noreply@resend.dev";

    // Prepare items list
    const items: TicketItem[] = [
      ...ticket.products.map((tp) => ({
        quantity: tp.quantity,
        unitPrice: tp.unitPrice,
        total: tp.total,
        product: tp.product,
        service: null,
      })),
      ...ticket.services.map((ts) => ({
        quantity: ts.quantity,
        unitPrice: ts.unitPrice,
        total: ts.total,
        product: null,
        service: ts.service,
      })),
    ];

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);
    };

    // Format date
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(date));
    };

    // Build items HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.product?.name || item.service?.name || "Item"}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatCurrency(item.unitPrice)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${formatCurrency(item.total)}
          </td>
        </tr>
      `
      )
      .join("");

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket #${ticket.id}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #5faf87 0%, #4a9a70 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${businessName}</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">Detalles de tu ticket</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px;">
                ${customMessage ? `
                  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">${customMessage}</p>
                  </div>
                ` : ""}
                
                <!-- Ticket Info -->
                <div style="text-align: center; margin-bottom: 25px;">
                  <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">Ticket ID</p>
                  <p style="color: #111827; margin: 0; font-size: 24px; font-weight: 700;">#${ticket.id}</p>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 13px;">${formatDate(ticket.createdAt)}</p>
                </div>
                
                <!-- Client & Staff Info -->
                <div style="display: flex; gap: 20px; margin-bottom: 25px;">
                  <div style="flex: 1; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                    <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</p>
                    <p style="color: #111827; margin: 0; font-weight: 600;">${ticket.client?.name || "-"}</p>
                    ${ticket.client?.email ? `<p style="color: #6b7280; margin: 5px 0 0 0; font-size: 13px;">${ticket.client.email}</p>` : ""}
                  </div>
                  <div style="flex: 1; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                    <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Atendido por</p>
                    <p style="color: #111827; margin: 0; font-weight: 600;">${ticket.staff?.name || ticket.staff?.email || "-"}</p>
                  </div>
                </div>
                
                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 13px;">Artículo</th>
                      <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; font-size: 13px;">Cant.</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; font-size: 13px;">Precio</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; font-size: 13px;">Total</th>
                    </tr>
                  </thead>
                  <tbody style="color: #4b5563; font-size: 14px;">
                    ${itemsHtml || '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #9ca3af;">No hay artículos en este ticket</td></tr>'}
                  </tbody>
                </table>
                
                <!-- Total -->
                <div style="background: linear-gradient(135deg, #5faf87 0%, #4a9a70 100%); padding: 20px; border-radius: 8px; text-align: right;">
                  <p style="color: rgba(255, 255, 255, 0.8); margin: 0 0 5px 0; font-size: 14px;">Total</p>
                  <p style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${formatCurrency(ticket.total)}</p>
                </div>
                
                ${ticket.notes ? `
                  <div style="margin-top: 25px; padding: 15px; background-color: #fffbeb; border-radius: 8px; border: 1px solid #fcd34d;">
                    <p style="color: #92400e; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Notas</p>
                    <p style="color: #78350f; margin: 0; font-size: 14px;">${ticket.notes}</p>
                  </div>
                ` : ""}
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 13px;">¡Gracias por tu preferencia!</p>
                <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">${businessName}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: `${businessName} <${businessEmail}>`,
      to: [toEmail],
      subject: `Ticket #${ticket.id} - ${businessName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: data?.id,
      sentTo: toEmail,
    });
  } catch (error) {
    console.error("Error sending ticket email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
