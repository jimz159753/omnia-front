"use client";

import type { Client } from "@/hooks/useClientsPage";
import { FiEdit2 } from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  client?: Client | null;
  onEdit?: () => void;
};

const SelectedClient: React.FC<Props> = ({ client, onEdit }) => {
  const { t } = useTranslation("clients");

  if (!client) {
    return <p className="text-sm text-gray-500">{t("noClient")}</p>;
  }

  return (
    <div className="bg-white space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{client.name}</h3>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FiEdit2 className="w-4 h-4" />
          <p className="font-semibold">{t("editClient")}</p>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">{t("email")}:</span> {client.email}
        </p>
        <p>
          <span className="font-semibold">{t("mobile")}:</span> {client.phone}
        </p>
        <p>
          <span className="font-semibold">{t("instagram")}:</span>{" "}
          {client.instagram || "-"}
        </p>
        <p>
          <span className="font-semibold">{t("address")}:</span>{" "}
          {client.address || "-"}
        </p>
        <p>
          <span className="font-semibold">{t("ticketsLabel")}:</span>{" "}
          {client.tickets?.length ?? 0}
        </p>
      </div>
    </div>
  );
};

export default SelectedClient;
