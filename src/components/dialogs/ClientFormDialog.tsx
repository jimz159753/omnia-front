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

  const handleClientSubmit = async (values: {
    instagram: string;
    address: string;
    birthday?: Date;
  }) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? t("editClient") : t("addClient")}</DialogTitle>
          <DialogDescription>
            {client ? t("editClientDescription") : t("addClientDescription")}
          </DialogDescription>
        </DialogHeader>
        {clientError && <p className="text-sm text-red-600">{clientError}</p>}
        {clientSuccess && (
          <p className="text-sm text-green-600">{clientSuccess}</p>
        )}
        <form onSubmit={handleSubmit(handleClientSubmit)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("name")}
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")}
            </label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")}
            </label>
            <input
              {...register("phone", { required: "Phone is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("instagramOptional")}
            </label>
            <input
              {...register("instagram")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("instagram")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")}
            </label>
            <input
              {...register("address")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={t("address")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
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
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("saving") : t("saveClient")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
