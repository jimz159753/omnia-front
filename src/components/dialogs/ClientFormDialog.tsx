"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";
import { FiUser, FiMail, FiPhone, FiInstagram, FiMapPin, FiCalendar, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    instagram?: string | null;
    address?: string | null;
    birthday?: string | null;
  } | null;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  onSuccess,
  client = null,
}: ClientFormDialogProps) {
  const { t } = useTranslation("common");
  const [clientError, setClientError] = useState("");
  const [clientSuccess, setClientSuccess] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      instagram: client?.instagram || "",
      address: client?.address || "",
      birthday: client?.birthday ? new Date(client.birthday) : undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: client?.name || "",
        email: client?.email || "",
        phone: client?.phone || "",
        instagram: client?.instagram || "",
        address: client?.address || "",
        birthday: client?.birthday ? new Date(client.birthday) : undefined,
      });
    }
  }, [open, client, reset]);

  const handleClientSubmit = async (values: any) => {
    setClientError("");
    setClientSuccess("");
    try {
      const isEditMode = !!client?.id;
      const url = isEditMode ? `/api/clients?id=${client?.id}` : "/api/clients";
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create client");
      }

      const successMessage = isEditMode
        ? t("clientUpdatedSuccess")
        : t("clientCreatedSuccess");
      setClientSuccess(successMessage);
      reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("clientCreateError");
      setClientError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl bg-omnia-light border-omnia-navy/20">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {client ? t("editClient") : t("addClient")}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm">
                {client ? t("editClientDescription") : t("addClientDescription")}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 bg-omnia-light/50">
          {/* Status messages */}
          {clientError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{clientError}</p>
            </div>
          )}
          {clientSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
              <FiCheck className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700 font-medium">{clientSuccess}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleClientSubmit)} className="space-y-4">
            {/* Required fields card */}
            <div className="bg-white rounded-xl border border-omnia-navy/10 p-4 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-omnia-blue/10 flex items-center justify-center">
                  <FiCheck className="w-3.5 h-3.5 text-omnia-blue" />
                </div>
                <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">Información requerida</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                  {t("name")}
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-omnia-navy/30 w-4 h-4" />
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full h-10 rounded-xl border-2 border-omnia-navy/10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                    placeholder="Nombre completo"
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-red-600 font-medium">{errors.name.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                    {t("email")}
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-omnia-navy/30 w-4 h-4" />
                    <input
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      className="w-full h-10 rounded-xl border-2 border-omnia-navy/10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                      placeholder="correo@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.email.message as string}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-omnia-navy/30 w-4 h-4" />
                    <input
                      {...register("phone", { required: "Phone is required" })}
                      className="w-full h-10 rounded-xl border-2 border-omnia-navy/10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                      placeholder="+52 33..."
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-600 font-medium">{errors.phone.message as string}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Optional fields card */}
            <div className="bg-white rounded-xl border border-omnia-navy/10 p-4 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-omnia-navy/10 flex items-center justify-center">
                  <FiMapPin className="w-3.5 h-3.5 text-omnia-navy" />
                </div>
                <span className="text-xs font-semibold text-omnia-navy uppercase tracking-wider">Información opcional</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                    {t("instagramOptional")}
                  </label>
                  <div className="relative">
                    <FiInstagram className="absolute left-3 top-1/2 -translate-y-1/2 text-omnia-navy/30 w-4 h-4" />
                    <input
                      {...register("instagram")}
                      className="w-full h-10 rounded-xl border-2 border-omnia-navy/10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                      placeholder="usuario"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                    {t("birthday")}
                  </label>
                  <Controller
                    control={control}
                    name="birthday"
                    render={({ field }) => (
                      <DatePicker
                        value={field.value as Date | undefined}
                        onChange={field.onChange}
                        placeholder={t("birthday")}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        className="w-full h-10 border-omnia-navy/10 rounded-xl"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-omnia-navy/70 uppercase tracking-wider">
                  {t("address")}
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-omnia-navy/30 w-4 h-4" />
                  <input
                    {...register("address")}
                    className="w-full h-10 rounded-xl border-2 border-omnia-navy/10 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 px-6 rounded-xl border-2 border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5 font-medium transition-all"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-6 rounded-xl bg-omnia-blue hover:bg-omnia-blue/90 text-white font-bold shadow-lg shadow-omnia-blue/25 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    {t("saveClient")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
