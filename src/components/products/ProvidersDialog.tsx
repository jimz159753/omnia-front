"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { Provider } from "@/hooks/useProductMeta";
import { useTranslation } from "@/hooks/useTranslation";

interface ProvidersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  loading: boolean;
  providerForm: { name: string };
  setProviderForm: (form: { name: string }) => void;
  editingProvider: Provider | null;
  onCreateProvider: () => void;
  onUpdateProvider: () => void;
  onDeleteProvider: (id: string) => void;
  onStartEdit: (provider: Provider) => void;
  onCancelEdit: () => void;
}

export function ProvidersDialog({
  open,
  onOpenChange,
  providers,
  loading,
  providerForm,
  setProviderForm,
  editingProvider,
  onCreateProvider,
  onUpdateProvider,
  onDeleteProvider,
  onStartEdit,
  onCancelEdit,
}: ProvidersDialogProps) {
  const { t } = useTranslation("products");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProvider) {
      onUpdateProvider();
    } else {
      onCreateProvider();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("providers") || "Providers"}</DialogTitle>
        </DialogHeader>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="flex gap-3 items-end border-b pb-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("name") || "Name"} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={providerForm.name}
              onChange={(e) => setProviderForm({ name: e.target.value })}
              placeholder={t("providerName") || "Provider name"}
            />
          </div>
          <div className="flex gap-2">
            {editingProvider && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center gap-2"
            >
              {editingProvider ? (
                <>
                  <FiEdit2 className="w-4 h-4" />
                  {t("update") || "Update"}
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  {t("add") || "Add"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("noProvidersFound") || "No providers found. Add your first provider above."}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    {t("name") || "Name"}
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-24">
                    {t("actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr
                    key={provider.id}
                    className={`hover:bg-gray-50 ${
                      editingProvider?.id === provider.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {provider.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onStartEdit(provider)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title={t("editProduct") || "Edit"}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("confirmDeleteProvider") || "Are you sure you want to delete this provider?")) {
                              onDeleteProvider(provider.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={t("deleteProduct") || "Delete"}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {providers.length} {providers.length !== 1 ? t("providersCount") || "providers" : t("providerCount") || "provider"}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {t("close") || "Close"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
