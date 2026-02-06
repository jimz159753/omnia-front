"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiBriefcase } from "react-icons/fi";
import { Provider } from "@/hooks/useProductMeta";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-omnia-navy/20 bg-omnia-light">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FiBriefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t("providers") || "Providers"}
              </DialogTitle>
              <p className="text-white/70 text-sm">
                {t("manageProvidersDesc") || "Add or update the providers for your products."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="flex gap-3 items-end bg-white border border-omnia-navy/10 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-omnia-navy/70 uppercase tracking-wider">
                {t("name") || "Name"} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full h-11 rounded-xl border-2 border-omnia-navy/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                value={providerForm.name}
                onChange={(e) => setProviderForm({ name: e.target.value })}
                placeholder={t("providerName") || "Provider name"}
                required
              />
            </div>
            <div className="flex gap-2 h-11">
              {editingProvider && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="h-11 rounded-xl border-2 border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="submit"
                className="h-11 rounded-xl bg-omnia-blue hover:bg-omnia-blue/90 text-white shadow-lg shadow-omnia-blue/20 flex items-center gap-2"
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
              </Button>
            </div>
          </form>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white border border-omnia-navy/10 rounded-xl shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-omnia-blue"></div>
              </div>
            ) : providers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-omnia-blue/5 flex items-center justify-center mb-4">
                  <FiBriefcase className="w-8 h-8 text-omnia-blue/30" />
                </div>
                <h4 className="text-omnia-dark font-medium mb-1">{t("noProvidersFound") || "No providers found"}</h4>
                <p className="text-sm text-omnia-navy/50">{t("addFirstProvider") || "Add your first provider using the form above."}</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-omnia-light/50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider">
                      {t("name") || "Name"}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider w-24">
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-omnia-navy/5">
                  {providers.map((provider) => (
                    <tr
                      key={provider.id}
                      className={`group hover:bg-omnia-blue/5 transition-colors ${
                        editingProvider?.id === provider.id ? "bg-omnia-blue/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-omnia-dark">
                        {provider.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onStartEdit(provider)}
                            className="p-2 rounded-lg text-omnia-navy/40 hover:text-omnia-blue hover:bg-omnia-blue/10 transition-all"
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
                            className="p-2 rounded-lg text-omnia-navy/40 hover:text-red-600 hover:bg-red-50 transition-all"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-omnia-navy/10 shrink-0 flex justify-between items-center">
          <span className="text-xs font-semibold text-omnia-navy/50 uppercase tracking-widest">
            {providers.length} {providers.length !== 1 ? t("providersCount") || "providers" : t("providerCount") || "provider"}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5 px-6"
          >
            {t("close") || "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
