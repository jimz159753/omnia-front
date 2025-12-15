import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatTicketDateTime } from "@/lib/dateUtils";

/**
 * Ticket item interface matching the dialog
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
 * PDF Props interface
 */
interface TicketPDFProps {
  ticket: TicketData;
  business: BusinessData;
  translations: Translations;
}

/**
 * PDF Styles matching the dialog design
 * Follows KISS principle - simple, clear styling
 */
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  businessName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8b5cf6",
    textAlign: "center",
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dateText: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 10,
    color: "#6b7280",
  },
  ticketIdContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  ticketIdLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
  },
  ticketIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingVertical: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  itemsSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 20,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderStyle: "solid",
  },
  itemLeft: {
    flexDirection: "column",
  },
  itemName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 9,
    color: "#6b7280",
  },
  itemTotal: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  emptyText: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 20,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  thanksText: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 10,
  },
});

/**
 * Format currency for PDF display
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

/**
 * Ticket PDF Document Component
 * Follows SRP - Only responsible for rendering PDF structure
 * Mirrors TicketDetailsDialog design
 */
export const TicketPDF: React.FC<TicketPDFProps> = ({
  ticket,
  business,
  translations,
}) => {
  const { dateStr, timeStr } = formatTicketDateTime(ticket.createdAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{translations.ticketDetails}</Text>
        </View>

        {/* Business Logo or Name */}
        <View style={styles.logoContainer}>
          {business.logo ? (
            <Image src={business.logo} style={styles.logo} />
          ) : (
            <Text style={styles.businessName}>
              {business.name || "Business"}
            </Text>
          )}
        </View>

        {/* Date and Time */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>

        {/* Ticket ID */}
        <View style={styles.ticketIdContainer}>
          <Text style={styles.ticketIdLabel}>{translations.ticketID}</Text>
          <Text style={styles.ticketIdValue}>#{ticket.id || "-"}</Text>
        </View>

        {/* Client and Staff Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {translations.clientLabel}:{" "}
            </Text>
            <Text style={styles.infoValue}>
              {ticket.client?.name || "-"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {translations.staffLabel}:{" "}
            </Text>
            <Text style={styles.infoValue}>
              {ticket.staff?.name || ticket.staff?.email || "-"}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>{translations.itemsLabel}</Text>
          {ticket.items && ticket.items.length > 0 ? (
            ticket.items.map((item, idx) => (
              <View key={idx} style={styles.item}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>
                    {item.product?.name || item.service?.name || "Item"}
                  </Text>
                  <Text style={styles.itemQty}>
                    {translations.qtyLabel}: {item.quantity ?? 1}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.total || 0)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{translations.itemsEmpty}</Text>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>{translations.totalLabel}</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(ticket.total || 0)}
          </Text>
        </View>

        {/* Thanks Message */}
        <Text style={styles.thanksText}>{translations.thanks}</Text>
      </Page>
    </Document>
  );
};

