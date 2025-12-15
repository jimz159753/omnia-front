"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FiX } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientDetailsTabs from "@/components/clients/ClientDetailsTabs";
import ClientCombobox from "@/components/clients/ClientCombobox";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { formatCurrency } from "@/utils";

interface Product {
  id: string;
  name: string;
  cost: number;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type FormValues = {
  staffId: string;
  productId: string;
  quantity: string;
  includeNotes: boolean;
  notes: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  existingClientId: string;
};

type TicketStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export function SaleFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: SaleFormDialogProps) {
  const { t } = useTranslation("common");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus] = useState<TicketStatus>("Completed");

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      staffId: "",
      productId: "",
      quantity: "1",
      includeNotes: false,
      notes: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      existingClientId: "",
    },
  });

  const includeNotes = watch("includeNotes");
  const existingClientId = watch("existingClientId");
  const selectedProductId = watch("productId");
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const unitPrice = selectedProduct?.cost || 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, usersRes, clientsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/users"),
        fetch("/api/clients"),
      ]);

      const productsData = await productsRes.json();
      const usersData = await usersRes.json();
      const clientsData = await clientsRes.json();

      setProducts(productsData.data || []);
      setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      setClients(
        Array.isArray(clientsData) ? clientsData : clientsData.data || []
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("formDataLoadError") || "Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      // Reset form when dialog closes
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  const calculateTotal = () => {
    const quantityValue = parseInt(watch("quantity"), 10) || 1;
    return unitPrice * quantityValue;
  };

  const onSubmit = async (values: FormValues) => {
    if (!values.staffId || !values.productId) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      let clientId = values.existingClientId;
      if (!clientId) {
        const clientPayload = {
          name: values.clientName,
          email: values.clientEmail,
          phone: values.clientPhone,
        };

        const clientResponse = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientPayload),
        });

        let clientData;
        if (clientResponse.status === 409) {
          const existingClientRes = await fetch(
            `/api/clients?email=${encodeURIComponent(values.clientEmail)}`
          );
          clientData = await existingClientRes.json();
          if (!clientData || !clientData.id) {
            throw new Error("Client not found");
          }
        } else if (!clientResponse.ok) {
          throw new Error("Failed to create client");
        } else {
          const result = await clientResponse.json();
          clientData = result.data;
        }
        clientId = clientData.id;
      }

      const quantity = parseInt(values.quantity, 10) || 1;
      const total = unitPrice * quantity;

      const ticketResponse = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          staffId: values.staffId,
          items: [
            {
              productId: values.productId,
              quantity,
              unitPrice,
              total,
            },
          ],
          quantity,
          total,
          status: selectedStatus,
          notes: values.includeNotes ? values.notes : "",
        }),
      });

      if (!ticketResponse.ok) {
        const data = await ticketResponse.json();
        throw new Error(data.error || "Failed to create sale");
      }

      toast.success(t("ticketCreatedSuccess") || "Venta creada exitosamente");
      reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("ticketCreationError");
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">{t("createSale")}</DialogTitle>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="h-full flex">
            {/* Left Side - Sale Table */}
            <div className="flex-1 flex flex-col h-full border-r">
              {/* Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t("createSale")}</h2>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Sale Details Section */}
              <div className="p-6 border-b">
                <h3 className="text-sm font-semibold mb-3">
                  Detalles de la venta
                </h3>

                {/* Sale details in horizontal layout */}
                <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-md">
                  {/* Staff */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Personal
                    </label>
                    <Controller
                      control={control}
                      name="staffId"
                      rules={{ required: "Staff is required" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10 bg-white">
                            <SelectValue placeholder="Selecciona al staff" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.staffId && (
                      <p className="text-xs text-red-600">
                        {errors.staffId.message as string}
                      </p>
                    )}
                  </div>

                  {/* Product */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Producto
                    </label>
                    <Controller
                      control={control}
                      name="productId"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10 bg-white">
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register("quantity")}
                      className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="1"
                    />
                  </div>

                  {/* Unit Price (read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Precio
                    </label>
                    <div className="h-10 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100 flex items-center text-gray-500">
                      {formatCurrency(unitPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="border-t pt-4">
                  <div
                    className="flex items-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Controller
                      control={control}
                      name="includeNotes"
                      render={({ field }) => (
                        <Checkbox
                          id="include-notes"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(Boolean(checked));
                          }}
                        />
                      )}
                    />
                    <label
                      htmlFor="include-notes"
                      className="text-sm font-semibold text-gray-800 cursor-pointer select-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("addSaleNote")}
                    </label>
                  </div>
                </div>

                {/* Notes Textarea */}
                {includeNotes && (
                  <div className="space-y-2 mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="text-sm font-semibold text-gray-700">
                      {t("notesLabel")}
                    </label>
                    <textarea
                      {...register("notes")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                      placeholder={t("notesPlaceholder")}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Client Details */}
            <div className="flex flex-col justify-between w-1/3 h-full space-y-4 bg-gray-50">
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-semibold mb-4">{t("client")}</h3>

                {/* Client Tabs */}
                <ClientDetailsTabs
                  existingCount={clients.length}
                  activeTab={existingClientId ? "existing" : "new"}
                  onChange={(v) => {
                    if (v === "new") {
                      setValue("existingClientId", "");
                    } else if (clients.length > 0) {
                      setValue("existingClientId", clients[0].id);
                    }
                  }}
                />

                {/* Client Selection or Form */}
                <div className="mt-4">
                  {existingClientId ? (
                    <Controller
                      control={control}
                      name="existingClientId"
                      rules={{ required: "Client is required" }}
                      render={({ field }) => (
                        <ClientCombobox
                          clients={clients}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.existingClientId?.message as string}
                        />
                      )}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-normal text-gray-700">
                          {t("name")}
                        </label>
                        <input
                          {...register("clientName", {
                            required: "Client name is required",
                          })}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder={t("name")}
                        />
                        {errors.clientName && (
                          <p className="text-xs text-red-600">
                            {errors.clientName.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-normal text-gray-700">
                          {t("email")}
                        </label>
                        <input
                          type="email"
                          {...register("clientEmail", {
                            required: "Client email is required",
                          })}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder={t("email")}
                        />
                        {errors.clientEmail && (
                          <p className="text-xs text-red-600">
                            {errors.clientEmail.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-normal text-gray-700">
                          {t("phone")}
                        </label>
                        <input
                          {...register("clientPhone", {
                            required: "Client phone is required",
                          })}
                          className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder={t("phone")}
                        />
                        {errors.clientPhone && (
                          <p className="text-xs text-red-600">
                            {errors.clientPhone.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Section */}
              <div className="flex justify-between items-center text-lg border-t p-6">
                <span className="font-semibold">{t("total")}:</span>
                <span className="font-bold text-2xl">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 p-6 border-t bg-white">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !watch("staffId") || !watch("productId")
                  }
                  className="flex-1 px-4 py-2.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? t("saving") : t("create")}
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
