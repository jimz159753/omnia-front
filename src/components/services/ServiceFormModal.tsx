"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { CustomAlert } from "@/components/ui/CustomAlert";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { useServiceForm } from "@/hooks/useServiceForm";

interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: ServiceWithRelations | null;
}

export function ServiceFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: ServiceFormModalProps) {
  const {
    isEditMode,
    formData,
    categories,
    subCategories,
    loading,
    error,
    success,
    fieldErrors,
    handleChange,
    handleSelectChange,
    handleSubmit,
  } = useServiceForm({ open, item, onSuccess, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Service" : "Add Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of the service."
              : "Fill in the details to add a new service."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Name<span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter service name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter service description"
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
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleSelectChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <Select
              value={formData.subCategoryId}
              onValueChange={(value) =>
                handleSelectChange("subCategoryId", value)
              }
              disabled={!formData.categoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subCategories
                  .filter(
                    (sub) =>
                      !formData.categoryId ||
                      sub.categoryId === formData.categoryId
                  )
                  .map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {fieldErrors.subCategoryId && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.subCategoryId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="text-sm font-medium text-gray-700"
              >
                Duration (min)<span className="text-red-500">*</span>
              </label>
              <input
                id="duration"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="60"
                min="1"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.duration}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
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
              <label
                htmlFor="commission"
                className="text-sm font-medium text-gray-700"
              >
                Commission<span className="text-red-500">*</span>
              </label>
              <input
                id="commission"
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleChange}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {fieldErrors.commission && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.commission}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="image"
              className="text-sm font-medium text-gray-700"
            >
              Image URL
            </label>
            <input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {fieldErrors.image && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.image}</p>
            )}
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
                ? "Update Service"
                : "Create Service"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

