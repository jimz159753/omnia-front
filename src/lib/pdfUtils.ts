import { pdf } from "@react-pdf/renderer";
import { TicketPDF } from "@/components/dialogs/ticket/TicketPDF";

/**
 * Ticket item interface
 */
interface TicketItem {
  quantity?: number;
  unitPrice?: number;
  total?: number;
  product?: { name?: string | null; price?: number | null } | null;
  service?: { name?: string | null; price?: number | null } | null;
}

/**
 * Ticket data interface
 */
interface TicketData {
  id?: string;
  createdAt?: string | Date;
  quantity?: number;
  status?: string;
  notes?: string | null;
  client?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  staff?: { name?: string | null; email?: string | null };
  items?: TicketItem[];
  total?: number;
}

/**
 * Business data interface
 */
interface BusinessData {
  name?: string;
  logo?: string | null;
}

/**
 * Translations interface
 */
interface Translations {
  ticketDetails: string;
  ticketID: string;
  clientLabel: string;
  staffLabel: string;
  itemsLabel: string;
  qtyLabel: string;
  itemsEmpty: string;
  totalLabel: string;
  thanks: string;
}

/**
 * Generate and download PDF for a ticket
 * Follows SRP - Only responsible for PDF generation and download
 *
 * @param ticket - The ticket data to generate PDF for
 * @param business - Business information (name, logo)
 * @param translations - Translated text for PDF labels
 * @returns Promise that resolves when download is triggered
 */
export const downloadTicketPDF = async (
  ticket: TicketData,
  business: BusinessData,
  translations: Translations
): Promise<void> => {
  try {
    // Generate PDF blob
    const blob = await pdf(
      TicketPDF({ ticket, business, translations }) as any
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ticket-${ticket.id || "unknown"}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

/**
 * Generate PDF blob without downloading
 * Useful for email attachments or preview
 *
 * @param ticket - The ticket data to generate PDF for
 * @param business - Business information (name, logo)
 * @param translations - Translated text for PDF labels
 * @returns Promise that resolves to PDF blob
 */
export const generateTicketPDFBlob = async (
  ticket: TicketData,
  business: BusinessData,
  translations: Translations
): Promise<Blob> => {
  try {
    const blob = await pdf(
      TicketPDF({ ticket, business, translations }) as any
    ).toBlob();
    return blob;
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    throw new Error("Failed to generate PDF blob");
  }
};
