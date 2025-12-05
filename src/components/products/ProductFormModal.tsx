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
import { ProductWithCategory } from "@/app/(dashboard)/dashboard/products/columns";
import { useProductForm } from "@/hooks/useProductForm";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: ProductWithCategory | null;
}

export function ProductFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: ProductFormModalProps) {
  const {
    isEditMode,
    formData,
    categories,
    loading,
    error,
    success,
    fieldErrors,
    handleChange,
    handleSubmit,
  } = useProductForm({ open, item, onSuccess, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of the product."
              : "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="Enter SKU"
              />
              {fieldErrors.sku && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.sku}</p>
              )}
            </div>

            <div>
              <CustomInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>
          </div>

          <div className="custom-input-container">
            <label htmlFor="description" className="custom-input-label">
              Description<span className="required-asterisk">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
              className="custom-input min-h-[80px]"
              rows={3}
            />
            {fieldErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="custom-input-container">
            <label htmlFor="categoryId" className="custom-input-label">
              Category<span className="required-asterisk">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="custom-input"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.subCategory && ` - ${category.subCategory.name}`}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="custom-input-container">
              <label htmlFor="stock" className="custom-input-label">
                Stock<span className="required-asterisk">*</span>
              </label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="0"
                min="0"
                step="1"
                className="custom-input"
              />
              {fieldErrors.stock && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.stock}</p>
              )}
            </div>

            <div className="custom-input-container">
              <label htmlFor="price" className="custom-input-label">
                Price<span className="required-asterisk">*</span>
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input"
              />
              {fieldErrors.price && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>
              )}
            </div>

            <div className="custom-input-container">
              <label htmlFor="cost" className="custom-input-label">
                Cost<span className="required-asterisk">*</span>
              </label>
              <input
                id="cost"
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="custom-input"
              />
              {fieldErrors.cost && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.cost}
                </p>
              )}
            </div>
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
                ? "Update Product"
                : "Create Product"}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

