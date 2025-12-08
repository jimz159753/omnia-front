"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  } | null;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  onSuccess,
  client = null,
}: ClientFormDialogProps) {
  const [clientError, setClientError] = useState("");
  const [clientSuccess, setClientSuccess] = useState("");

  const {
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
      });
    }
  }, [open, client, reset]);

  const handleClientSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    instagram: string;
    address: string;
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

      setClientSuccess(
        `Client ${isEditMode ? "updated" : "created"} successfully`
      );
      reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (error) {
      setClientError(
        error instanceof Error ? error.message : "Failed to create client"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>
            Fill out the client details below.
          </DialogDescription>
        </DialogHeader>
        {clientError && <p className="text-sm text-red-600">{clientError}</p>}
        {clientSuccess && (
          <p className="text-sm text-green-600">{clientSuccess}</p>
        )}
        <form onSubmit={handleSubmit(handleClientSubmit)} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Client name"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="client@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              {...register("phone", { required: "Phone is required" })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Phone number"
            />
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Instagram (optional)
            </label>
            <input
              {...register("instagram")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="@instagram"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              {...register("address")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Street address, city, state"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
