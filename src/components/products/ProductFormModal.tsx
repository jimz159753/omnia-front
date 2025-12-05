"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="Enter SKU"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.sku && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.sku}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              rows={3}
            />
            {fieldErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="categoryId"
              className="text-sm font-medium text-gray-700"
            >
              Category<span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium text-gray-700">
                Stock<span className="text-red-500">*</span>
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.stock && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price<span className="text-red-500">*</span>
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.price && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="cost" className="text-sm font-medium text-gray-700">
                Cost<span className="text-red-500">*</span>
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.cost && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.cost}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Product"
                : "Create Product"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

