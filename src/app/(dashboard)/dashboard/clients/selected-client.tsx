"use client";

import type { Client } from "@/hooks/useClientsPage";
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiInstagram, FiCalendar, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  client?: Client | null;
  onEdit?: () => void;
};

const SelectedClient: React.FC<Props> = ({ client, onEdit }) => {
  const { t, i18n } = useTranslation("clients");
  const currentLanguage = i18n.language || "en-US";

  // Get client initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  // Calculate stats from tickets
  const stats = {
    totalTickets: client?.tickets?.length ?? 0,
    totalSpent: client?.tickets?.reduce((sum, ticket) => sum + (ticket.total ?? 0), 0) ?? 0,
    lastVisit: client?.tickets?.[0]?.createdAt 
      ? new Date(client.tickets[0].createdAt).toLocaleDateString(currentLanguage, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
  };

  if (!client) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FiShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">{t("noClient") || "Select a client to view details"}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {getInitials(client.name)}
            </div>
            
            {/* Name & Quick Info */}
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                {client.email && (
                  <span className="flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                    {client.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
          >
            <FiEdit2 className="w-4 h-4" />
            {t("editClient") || "Edit"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <FiShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
            <p className="text-sm text-gray-500">{t("totalTickets") || "Total Tickets"}</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <FiDollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalSpent.toLocaleString(currentLanguage, { style: "currency", currency: "USD", minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500">{t("totalSpent") || "Total Spent"}</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.lastVisit}</p>
            <p className="text-sm text-gray-500">{t("lastVisit") || "Last Visit"}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-2 gap-4">
          {client.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <FiPhone className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t("mobile") || "Phone"}</p>
                <p className="text-sm font-medium text-gray-900">{client.phone}</p>
              </div>
            </div>
          )}
          
          {client.instagram && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FiInstagram className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t("instagram") || "Instagram"}</p>
                <p className="text-sm font-medium text-gray-900">@{client.instagram}</p>
              </div>
            </div>
          )}
          
          {client.address && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <FiMapPin className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{t("address") || "Address"}</p>
                <p className="text-sm font-medium text-gray-900">{client.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedClient;
