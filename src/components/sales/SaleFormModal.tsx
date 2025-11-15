"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomButton } from "@/components/ui/CustomButton";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { Sale } from "@/generated/prisma";

interface SaleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: Sale | null;
}

export function SaleFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: SaleFormModalProps) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    date: "",
    client: "",
    code: "",
    description: "",
    units: "",
    unitPrice: "",
    totalPrice: "",
    hasDiscount: false,
    discountPercentage: "",
    finalPrice: "",
    cardPayment: false,
    realIncome: "",
    paymentStatus: "",
    paymentMethod: "",
    account: "",
    seller: "",
    category: "",
    subCategory: "",
    provider: "",
    providerCost: "",
    providerPaymentStatus: "",
    comments: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Populate form when modal opens
  useEffect(() => {
    if (open) {
      if (item) {
        // Format date for input field (yyyy-MM-dd)
        const dateStr = new Date(item.date).toISOString().split("T")[0];

        setFormData({
          date: dateStr,
          client: item.client,
          code: item.code,
          description: item.description,
          units: item.units.toString(),
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
          hasDiscount: item.hasDiscount,
          discountPercentage: item.discountPercentage?.toString() || "",
          finalPrice: item.finalPrice.toString(),
          cardPayment: item.cardPayment,
          realIncome: item.realIncome.toString(),
          paymentStatus: item.paymentStatus,
          paymentMethod: item.paymentMethod,
          account: item.account,
          seller: item.seller,
          category: item.category,
          subCategory: item.subCategory || "",
          provider: item.provider,
          providerCost: item.providerCost.toString(),
          providerPaymentStatus: item.providerPaymentStatus,
          comments: item.comments || "",
        });
      } else {
        // Reset form for new item
        const today = new Date().toISOString().split("T")[0];
        setFormData({
          date: today,
          client: "",
          code: "",
          description: "",
          units: "1",
          unitPrice: "",
          totalPrice: "",
          hasDiscount: false,
          discountPercentage: "",
          finalPrice: "",
          cardPayment: false,
          realIncome: "",
          paymentStatus: "Pendiente",
          paymentMethod: "Efectivo",
          account: "Front Desk",
          seller: "",
          category: "",
          subCategory: "",
          provider: "",
          providerCost: "",
          providerPaymentStatus: "Pendiente",
          comments: "",
        });
      }
      setError("");
      setSuccess("");
    }
  }, [open, item]);

  // Auto-calculate total price when units or unit price changes
  useEffect(() => {
    const units = parseFloat(formData.units) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const totalPrice = units * unitPrice;

    if (totalPrice > 0 && formData.totalPrice !== totalPrice.toString()) {
      setFormData((prev) => ({
        ...prev,
        totalPrice: totalPrice.toFixed(2),
      }));
    }
  }, [formData.units, formData.unitPrice]);

  // Auto-calculate final price when total price or discount changes
  useEffect(() => {
    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;

    let finalPrice = totalPrice;
    if (formData.hasDiscount && discountPercentage > 0) {
      finalPrice = totalPrice - totalPrice * (discountPercentage / 100);
    }

    if (finalPrice !== parseFloat(formData.finalPrice)) {
      setFormData((prev) => ({
        ...prev,
        finalPrice: finalPrice.toFixed(2),
      }));
    }
  }, [formData.totalPrice, formData.hasDiscount, formData.discountPercentage]);

  // Auto-calculate real income considering card payment fee (5%)
  useEffect(() => {
    const finalPrice = parseFloat(formData.finalPrice) || 0;
    let realIncome = finalPrice;

    if (formData.cardPayment && finalPrice > 0) {
      realIncome = finalPrice * 0.95; // 5% fee for card payment
    }

    if (realIncome !== parseFloat(formData.realIncome)) {
      setFormData((prev) => ({
        ...prev,
        realIncome: realIncome.toFixed(2),
      }));
    }
  }, [formData.finalPrice, formData.cardPayment]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        date: new Date(formData.date).toISOString(),
        client: formData.client,
        code: formData.code,
        description: formData.description,
        units: parseInt(formData.units),
        unitPrice: parseFloat(formData.unitPrice),
        totalPrice: parseFloat(formData.totalPrice),
        hasDiscount: formData.hasDiscount,
        discountPercentage: formData.discountPercentage
          ? parseFloat(formData.discountPercentage)
          : null,
        finalPrice: parseFloat(formData.finalPrice),
        cardPayment: formData.cardPayment,
        realIncome: parseFloat(formData.realIncome),
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        account: formData.account,
        seller: formData.seller,
        category: formData.category,
        subCategory: formData.subCategory || null,
        provider: formData.provider,
        providerCost: parseFloat(formData.providerCost),
        providerPaymentStatus: formData.providerPaymentStatus,
        comments: formData.comments || null,
        ...(isEditMode && { id: item.id }),
      };

      const response = await fetch("/api/sales", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditMode ? "update" : "create"} sale`
        );
      }

      setSuccess(`Sale ${isEditMode ? "updated" : "created"} successfully!`);

      // Close modal and refresh data
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Sale" : "Add New Sale"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of the sale."
              : "Fill in the details to add a new sale."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          {/* Date and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="custom-input-container">
              <label htmlFor="date" className="custom-input-label">
                Date<span className="required-asterisk">*</span>
              </label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="custom-input"
              />
            </div>

            <CustomInput
              label="Client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              placeholder="Enter client name"
            />
          </div>

          {/* Code and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="Enter code (e.g., OM25)"
            />

            <CustomInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter description"
            />
          </div>

          {/* Units, Unit Price, Total Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="custom-input-container">
              <label htmlFor="units" className="custom-input-label">
                Units<span className="required-asterisk">*</span>
              </label>
              <input
                id="units"
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                required
                placeholder="1"
                min="1"
                step="1"
                className="custom-input"
              />
            </div>

            <div className="custom-input-container">
              <label htmlFor="unitPrice" className="custom-input-label">
                Unit Price<span className="required-asterisk">*</span>
              </label>
              <input
                id="unitPrice"
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input"
              />
            </div>

            <div className="custom-input-container">
              <label htmlFor="totalPrice" className="custom-input-label">
                Total Price<span className="required-asterisk">*</span>
              </label>
              <input
                id="totalPrice"
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="custom-input-container flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="hasDiscount"
                  checked={formData.hasDiscount}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm font-medium">Has Discount</span>
              </label>
            </div>

            <div className="custom-input-container">
              <label
                htmlFor="discountPercentage"
                className="custom-input-label"
              >
                Discount %
              </label>
              <input
                id="discountPercentage"
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="0.01"
                className="custom-input"
                disabled={!formData.hasDiscount}
              />
            </div>

            <div className="custom-input-container">
              <label htmlFor="finalPrice" className="custom-input-label">
                Final Price<span className="required-asterisk">*</span>
              </label>
              <input
                id="finalPrice"
                type="number"
                name="finalPrice"
                value={formData.finalPrice}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="custom-input-container flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="cardPayment"
                  checked={formData.cardPayment}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm font-medium">
                  Card Payment (5% fee)
                </span>
              </label>
            </div>

            <div className="custom-input-container">
              <label htmlFor="realIncome" className="custom-input-label">
                Real Income<span className="required-asterisk">*</span>
              </label>
              <input
                id="realIncome"
                type="number"
                name="realIncome"
                value={formData.realIncome}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Payment Status, Method, Account */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="custom-input-container">
              <label htmlFor="paymentStatus" className="custom-input-label">
                Payment Status<span className="required-asterisk">*</span>
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                required
                className="custom-input"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente de Pago">Pendiente de Pago</option>
              </select>
            </div>

            <div className="custom-input-container">
              <label htmlFor="paymentMethod" className="custom-input-label">
                Payment Method<span className="required-asterisk">*</span>
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="custom-input"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Ajuste">Ajuste</option>
              </select>
            </div>

            <div className="custom-input-container">
              <label htmlFor="account" className="custom-input-label">
                Account<span className="required-asterisk">*</span>
              </label>
              <select
                id="account"
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="custom-input"
              >
                <option value="Front Desk">Front Desk</option>
                <option value="Mercado Pago">Mercado Pago</option>
              </select>
            </div>
          </div>

          {/* Seller and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomInput
              label="Seller"
              name="seller"
              value={formData.seller}
              onChange={handleChange}
              required
              placeholder="Enter seller name"
            />

            <CustomInput
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Enter category"
            />

            <CustomInput
              label="Sub Category"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              placeholder="Enter sub category (optional)"
            />
          </div>

          {/* Provider Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomInput
              label="Provider"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              placeholder="Enter provider name"
            />

            <div className="custom-input-container">
              <label htmlFor="providerCost" className="custom-input-label">
                Provider Cost<span className="required-asterisk">*</span>
              </label>
              <input
                id="providerCost"
                type="number"
                name="providerCost"
                value={formData.providerCost}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input"
              />
            </div>

            <div className="custom-input-container">
              <label
                htmlFor="providerPaymentStatus"
                className="custom-input-label"
              >
                Provider Payment Status
                <span className="required-asterisk">*</span>
              </label>
              <select
                id="providerPaymentStatus"
                name="providerPaymentStatus"
                value={formData.providerPaymentStatus}
                onChange={handleChange}
                required
                className="custom-input"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>
          </div>

          {/* Comments */}
          <div className="custom-input-container">
            <label htmlFor="comments" className="custom-input-label">
              Comments
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              placeholder="Additional comments (optional)"
              className="custom-input min-h-[80px]"
              rows={3}
            />
          </div>

          <DialogFooter>
            <CustomButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </CustomButton>
            <CustomButton type="submit" disabled={loading}>
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Sale"
                : "Create Sale"}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
