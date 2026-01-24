"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import type { ClientFilter, Client } from "@/hooks/useClientsPage";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus, FiSearch, FiUser, FiMail, FiPhone } from "react-icons/fi";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

type Props = {
  clients: Client[];
  filteredClients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: ClientFilter;
  onFilterChange: (value: ClientFilter) => void;
  onAddClient: () => void;
};

const ITEM_HEIGHT = 88; // Height of each client card in pixels

const ClientSidebar: React.FC<Props> = ({
  clients,
  filteredClients,
  selectedClientId,
  onSelectClient,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  onAddClient,
}) => {
  const { t } = useTranslation("clients");
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  // Calculate available height for the list
  useEffect(() => {
    const updateHeight = () => {
      if (listContainerRef.current) {
        const containerRect = listContainerRef.current.getBoundingClientRect();
        // Subtract some padding
        setListHeight(Math.max(containerRect.height - 8, 200));
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Get client initials for avatar
  const getInitials = useCallback((name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  }, []);

  // Generate consistent color based on name
  const getAvatarColor = useCallback((name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }, []);

  // Virtualized row renderer
  const ClientRow = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const client = filteredClients[index];
      if (!client) return null;

      const isSelected = client.id === selectedClientId;

      return (
        <div style={style} className="px-1 py-1">
          <button
            onClick={() => onSelectClient(client.id)}
            className={`w-full text-left p-3 rounded-xl transition-all ${
              isSelected
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                : "bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                  isSelected ? "bg-white/20" : getAvatarColor(client.name)
                }`}
              >
                {getInitials(client.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium truncate ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}
                >
                  {client.name}
                </div>
                <div
                  className={`text-sm truncate flex items-center gap-1 ${
                    isSelected ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  <FiMail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div
                    className={`text-xs truncate flex items-center gap-1 mt-0.5 ${
                      isSelected ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    <FiPhone className="w-3 h-3 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {/* Ticket Count Badge */}
              {(client.tickets?.length ?? 0) > 0 && (
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-brand-100 text-brand-700"
                  }`}
                >
                  {client.tickets?.length}
                </div>
              )}
            </div>
          </button>
        </div>
      );
    },
    [filteredClients, selectedClientId, onSelectClient, getInitials, getAvatarColor]
  );

  return (
    <div className="flex flex-col w-80 h-[calc(100vh-80px)] border-r border-gray-200 bg-gray-50/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("title") || "Clients"}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredClients.length} {t("of") || "of"} {clients.length}
            </p>
          </div>
          <button
            onClick={onAddClient}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm"
            title={t("addClient") || "Add Client"}
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder") || "Search clients..."}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 text-sm"
          />
        </div>

        {/* Filter */}
        <Select
          value={filter}
          onValueChange={(value) => onFilterChange(value as ClientFilter)}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder={t("filterAll") || "All clients"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll") || "All clients"}</SelectItem>
            <SelectItem value="recent">{t("filterRecent") || "Recent"}</SelectItem>
            <SelectItem value="inactive">
              {t("filterInactive") || "Inactive"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client List - Virtualized */}
      <div ref={listContainerRef} className="flex-1 overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {t("noClientsFound") || "No clients found"}
            </p>
          </div>
        ) : (
          <List
            height={listHeight}
            itemCount={filteredClients.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {ClientRow}
          </List>
        )}
      </div>
    </div>
  );
};

export default ClientSidebar;
