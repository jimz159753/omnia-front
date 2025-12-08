"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface User {
  id: string;
  email: string;
}

interface SaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SaleFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: SaleFormDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    productId: "",
    serviceId: "",
    sellerId: "",
    amount: "",
    notes: "",
  });
  const [includeNotes, setIncludeNotes] = useState(false);

  // Client form state
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, servicesRes, usersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/services"),
        fetch("/api/users"),
      ]);

      const productsData = await productsRes.json();
      const servicesData = await servicesRes.json();
      const usersData = await usersRes.json();

      setProducts(productsData.data || []);
      setServices(servicesData.data || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Validate required fields
      if (
        !saleForm.productId ||
        !saleForm.serviceId ||
        !saleForm.sellerId ||
        !saleForm.amount ||
        !clientForm.name ||
        !clientForm.email ||
        !clientForm.phone ||
        !clientForm.instagram
      ) {
        setError("All fields are required");
        return;
      }

      // First, create or find the client
      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });

      let clientData;
      if (clientResponse.status === 409) {
        // Client already exists, fetch by email
        const existingClientRes = await fetch(
          `/api/clients?email=${clientForm.email}`
        );
        clientData = await existingClientRes.json();
      } else if (!clientResponse.ok) {
        throw new Error("Failed to create client");
      } else {
        const result = await clientResponse.json();
        clientData = result.data;
      }

      // Create the ticket
      const ticketResponse = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientData.id,
          productId: saleForm.productId,
          serviceId: saleForm.serviceId,
          sellerId: saleForm.sellerId,
          amount: parseFloat(saleForm.amount),
          status: "pending",
          notes: includeNotes ? saleForm.notes : "",
        }),
      });

      if (!ticketResponse.ok) {
        const data = await ticketResponse.json();
        throw new Error(data.error || "Failed to create ticket");
      }

      setSuccess("Ticket created successfully");
      setSaleForm({
        productId: "",
        serviceId: "",
        sellerId: "",
        amount: "",
        notes: "",
      });
      setIncludeNotes(false);
      setClientForm({
        name: "",
        email: "",
        phone: "",
        instagram: "",
        address: "",
      });

      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Sale</DialogTitle>
          <DialogDescription>
            Fill out the sale and client details below
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Side - Sale Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sale Details</h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <Select
                    value={saleForm.productId}
                    onValueChange={(value) =>
                      setSaleForm((prev) => ({ ...prev, productId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Service
                  </label>
                  <Select
                    value={saleForm.serviceId}
                    onValueChange={(value) =>
                      setSaleForm((prev) => ({ ...prev, serviceId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - ${service.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Seller
                  </label>
                  <Select
                    value={saleForm.sellerId}
                    onValueChange={(value) =>
                      setSaleForm((prev) => ({ ...prev, sellerId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    value={saleForm.amount}
                    onChange={handleSaleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Checkbox
                      id="include-notes"
                      checked={includeNotes}
                      onCheckedChange={(checked) =>
                        setIncludeNotes(Boolean(checked))
                      }
                    />
                    <label
                      htmlFor="include-notes"
                      className="text-sm font-semibold text-gray-800 cursor-pointer select-none flex-1"
                    >
                      Add sale note?
                    </label>
                  </div>

                  {includeNotes && (
                    <div className="pt-3 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      <label className="text-sm font-semibold text-gray-800">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={saleForm.notes}
                        onChange={(e) =>
                          setSaleForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                        placeholder="Add any notes about this sale..."
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Client Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Information</h3>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Name
                  </label>
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
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
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
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
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

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    name="address"
                    value={clientForm.address}
                    onChange={handleClientInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Street address, city, state"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-end gap-2 pt-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Generate Ticket"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
