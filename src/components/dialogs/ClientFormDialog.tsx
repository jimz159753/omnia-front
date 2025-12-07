"use client";

import type React from "react";
import { useState } from "react";
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
}

export function ClientFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: ClientFormDialogProps) {
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
  });
  const [clientError, setClientError] = useState("");
  const [clientSuccess, setClientSuccess] = useState("");
  const [clientSubmitting, setClientSubmitting] = useState(false);

  const handleClientInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    setClientSuccess("");
    setClientSubmitting(true);
    try {
      if (
        !clientForm.name ||
        !clientForm.email ||
        !clientForm.phone ||
        !clientForm.instagram
      ) {
        setClientError("All fields are required");
        return;
      }

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create client");
      }

      setClientSuccess("Client created successfully");
      setClientForm({
        name: "",
        email: "",
        phone: "",
        instagram: "",
      });
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (error) {
      setClientError(
        error instanceof Error ? error.message : "Failed to create client"
      );
    } finally {
      setClientSubmitting(false);
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
        <form onSubmit={handleClientSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={clientForm.name}
              onChange={handleClientInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Client name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={clientForm.email}
              onChange={handleClientInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="client@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={clientForm.phone}
              onChange={handleClientInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Phone number"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              name="instagram"
              value={clientForm.instagram}
              onChange={handleClientInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="@instagram"
              required
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
              disabled={clientSubmitting}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clientSubmitting ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

