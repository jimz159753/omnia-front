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
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { formatCurrency } from "@/utils";
import { TICKET_STATUSES, getStatusLabel } from "@/constants/status";

interface Product {
  id: string;
  name: string;
  cost: number;
  isClassPackage?: boolean; // True if this is a class package (service with classes)
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

interface EditTicketData {
  id: string;
  clientId?: string;
  staffId?: string;
  status?: string;
  notes?: string;
  items?: Array<{
    id?: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editTicket?: EditTicketData | null;
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
  clientInstagram: string;
  clientAddress: string;
  clientBirthday: Date | undefined;
  existingClientId: string;
};

type TicketStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export function SaleFormDialog({
  open,
  onOpenChange,
  onSuccess,
  editTicket,
}: SaleFormDialogProps) {
  const { t } = useTranslation("common");
  const { t: tSales } = useTranslation("sales");
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("Completed");
  
  const isEditing = !!editTicket;

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
      clientInstagram: "",
      clientAddress: "",
      clientBirthday: undefined,
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
      const [productsRes, usersRes, clientsRes, servicesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/users"),
        fetch("/api/clients"),
        fetch("/api/services"),
      ]);

      const productsData = await productsRes.json();
      const usersData = await usersRes.json();
      const clientsData = await clientsRes.json();
      const servicesData = await servicesRes.json();

      // Get regular products
      const regularProducts: Product[] = (productsData.data || []).map((p: { id: string; name: string; cost: number }) => ({
        id: p.id,
        name: p.name,
        cost: p.cost,
        isClassPackage: false,
      }));

      // Get class packages (services with classes > 0)
      const allServices = servicesData.data || [];
      const classPackages: Product[] = allServices
        .filter((s: { classes?: number | null }) => s.classes && s.classes > 0)
        .map((s: { id: string; name: string; price: number; classes?: number | null }) => ({
          id: s.id,
          name: `${s.name} (${s.classes} clases)`,
          cost: s.price,
          isClassPackage: true,
        }));

      // Combine products and class packages
      setProducts([...regularProducts, ...classPackages]);
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
      setSelectedStatus("Completed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

  // Populate form with edit data when editing
  useEffect(() => {
    if (open && editTicket && products.length > 0 && users.length > 0) {
      // Set staff
      if (editTicket.staffId) {
        setValue("staffId", editTicket.staffId);
      }
      
      // Set product and quantity from first item
      const firstItem = editTicket.items?.[0];
      if (firstItem?.productId) {
        setValue("productId", firstItem.productId);
        setValue("quantity", firstItem.quantity?.toString() || "1");
      }
      
      // Set notes
      if (editTicket.notes) {
        setValue("includeNotes", true);
        setValue("notes", editTicket.notes);
      }
      
      // Set client
      if (editTicket.clientId) {
        setValue("existingClientId", editTicket.clientId);
      }
      
      // Set status
      if (editTicket.status) {
        setSelectedStatus(editTicket.status as TicketStatus);
      }
    }
  }, [open, editTicket, products, users, setValue]);

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
          instagram: values.clientInstagram || null,
          address: values.clientAddress || "",
          birthday: values.clientBirthday || null,
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

      if (isEditing && editTicket) {
        // Update existing ticket
        const ticketResponse = await fetch("/api/tickets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editTicket.id,
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
          throw new Error(data.error || "Failed to update sale");
        }

        toast.success(tSales("ticketUpdatedSuccess") || "Venta actualizada exitosamente");
      } else {
        // Create new ticket - handle both products and class packages
        const isClassPackage = selectedProduct?.isClassPackage || false;
        const ticketResponse = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            staffId: values.staffId,
            items: [
              isClassPackage
                ? {
                    serviceId: values.productId, // Class packages are services
                    quantity,
                    unitPrice,
                    total,
                  }
                : {
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
      }

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
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] p-0 gap-0 [&>button]:hidden overflow-hidden rounded-2xl">
        <DialogTitle className="sr-only">
          {isEditing ? tSales("editSale") : t("createSale")}
        </DialogTitle>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-brand-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-brand-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">{t("loading")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="h-full flex">
            {/* Left Side - Sale Details */}
            <div className="flex-[2] flex flex-col h-full bg-white">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {isEditing ? tSales("editSale") : "Nueva Venta"}
                    </h2>
                    <p className="text-white/70 text-sm">Registra la venta de productos o paquetes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Sale Details Section */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Product Selection Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800">Producto o Paquete</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Product */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seleccionar Item
                      </label>
                      <Controller
                        control={control}
                        name="productId"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 bg-white border-gray-200 hover:border-brand-300 transition-colors">
                              <SelectValue placeholder="Elige un producto o paquete..." />
                            </SelectTrigger>
                            <SelectContent>
                              {products.filter(p => !p.isClassPackage).length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">Productos</div>
                                  {products.filter(p => !p.isClassPackage).map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{product.name}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-brand-600 font-medium">{formatCurrency(product.cost)}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              {products.filter(p => p.isClassPackage).length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase mt-2">Paquetes de Clases</div>
                                  {products.filter(p => p.isClassPackage).map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                          Paquete
                                        </span>
                                        <span>{product.name}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-brand-600 font-medium">{formatCurrency(product.cost)}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        {...register("quantity")}
                        className="w-full h-12 rounded-lg border border-gray-200 px-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white hover:border-brand-300 transition-colors"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Selected Product Info */}
                  {selectedProduct && (
                    <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-100 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedProduct.isClassPackage ? 'bg-blue-100' : 'bg-brand-100'}`}>
                            {selectedProduct.isClassPackage ? (
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{selectedProduct.name}</p>
                            {selectedProduct.isClassPackage && (
                              <span className="text-xs text-blue-600 font-medium">Paquete de clases</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Precio unitario</p>
                          <p className="text-xl font-bold text-brand-600">{formatCurrency(unitPrice)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staff Selection Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800">Vendedor</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asignar a
                      </label>
                      <Controller
                        control={control}
                        name="staffId"
                        rules={{ required: "Staff is required" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-12 bg-white border-gray-200 hover:border-purple-300 transition-colors">
                              <SelectValue placeholder="Selecciona un vendedor..." />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                                      {(user.name || user.email).charAt(0).toUpperCase()}
                                    </div>
                                    <span>{user.name || user.email}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.staffId && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.staffId.message as string}
                        </p>
                      )}
                    </div>

                    {/* Status (only when editing) */}
                    {isEditing && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("status")}
                        </label>
                        <Select
                          value={selectedStatus}
                          onValueChange={(value) => setSelectedStatus(value as TicketStatus)}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-200">
                            <SelectValue placeholder={tSales("selectStatus")} />
                          </SelectTrigger>
                          <SelectContent>
                            {TICKET_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {getStatusLabel(status.value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
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
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                      )}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <label
                        htmlFor="include-notes"
                        className="font-semibold text-gray-800 cursor-pointer select-none"
                      >
                        Agregar notas a la venta
                      </label>
                    </div>
                  </div>

                  {includeNotes && (
                    <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      <textarea
                        {...register("notes")}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                        placeholder="Escribe las notas de la venta aquí..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Client Details */}
            <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 border-l">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{t("client")}</h3>
                </div>

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
                    <div className="space-y-4 bg-white/50 p-4 rounded-xl border border-gray-100">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("name")}
                        </label>
                        <input
                          {...register("clientName", {
                            required: "Client name is required",
                          })}
                          className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                          placeholder="Nombre completo"
                        />
                        {errors.clientName && (
                          <p className="text-xs text-red-600">
                            {errors.clientName.message as string}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("email")}
                            </label>
                            <input
                            type="email"
                            {...register("clientEmail", {
                                required: "Client email is required",
                            })}
                            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                            placeholder="correo@ejemplo.com"
                            />
                            {errors.clientEmail && (
                            <p className="text-xs text-red-600">
                                {errors.clientEmail.message as string}
                            </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("phone")}
                            </label>
                            <input
                            {...register("clientPhone", {
                                required: "Client phone is required",
                            })}
                            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                            placeholder="+52 33 1234 5678"
                            />
                            {errors.clientPhone && (
                            <p className="text-xs text-red-600">
                                {errors.clientPhone.message as string}
                            </p>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Instagram
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">@</span>
                                <input
                                {...register("clientInstagram")}
                                className="w-full h-11 rounded-lg border border-gray-200 pl-7 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                                placeholder="usuario"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("birthday")}
                            </label>
                            <Controller
                                control={control}
                                name="clientBirthday"
                                render={({ field }) => (
                                    <DatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder={t("birthday")}
                                        captionLayout="dropdown"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                    />
                                )}
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t("address")}
                        </label>
                        <input
                          {...register("clientAddress")}
                          className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all"
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Section with gradient */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/80 font-medium">Subtotal</span>
                  <span className="text-white font-semibold">{formatCurrency(unitPrice)} × {watch("quantity") || 1}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/20">
                  <span className="text-white font-bold text-lg">Total</span>
                  <span className="font-black text-3xl text-white">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 p-4 bg-white border-t">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !watch("staffId") || !watch("productId")}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {isEditing ? t("save") : "Completar Venta"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

