"use client";

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
import { useSaleForm } from "@/hooks/useSaleForm";

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
  const {
    isEditMode,
    formData,
    loading,
    error,
    success,
    fieldErrors,
    handleChange,
    handleSubmit,
  } = useSaleForm({ open, item, onSuccess, onOpenChange });

  const ErrorMessage = ({ field }: { field: string }) => {
    return fieldErrors[field] ? (
      <p className="text-red-500 text-sm mt-1">{fieldErrors[field]}</p>
    ) : null;
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
              <ErrorMessage field="date" />
            </div>

            <div>
              <CustomInput
                label="Client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                placeholder="Enter client name"
              />
              <ErrorMessage field="client" />
            </div>
          </div>

          {/* Code and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                label="Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Enter code (e.g., OM25)"
              />
              <ErrorMessage field="code" />
            </div>

            <div>
              <CustomInput
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter description"
              />
              <ErrorMessage field="description" />
            </div>
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
              <ErrorMessage field="units" />
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
              <ErrorMessage field="unitPrice" />
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
              <ErrorMessage field="totalPrice" />
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
            <div>
              <CustomInput
                label="Seller"
                name="seller"
                value={formData.seller}
                onChange={handleChange}
                required
                placeholder="Enter seller name"
              />
              <ErrorMessage field="seller" />
            </div>

            <div>
              <CustomInput
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="Enter category"
              />
              <ErrorMessage field="category" />
            </div>

            <div>
              <CustomInput
                label="Sub Category"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="Enter sub category (optional)"
              />
              <ErrorMessage field="subCategory" />
            </div>
          </div>

          {/* Provider Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CustomInput
                label="Provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                required
                placeholder="Enter provider name"
              />
              <ErrorMessage field="provider" />
            </div>

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
              <ErrorMessage field="providerCost" />
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
              <ErrorMessage field="providerPaymentStatus" />
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
