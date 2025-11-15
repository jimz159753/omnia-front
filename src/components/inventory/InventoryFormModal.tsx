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
import { Category } from "@/generated/prisma";
import { InventoryWithCategory } from "@/app/(dashboard)/dashboard/inventory/columns";

interface InventoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: InventoryWithCategory | null;
}

interface CategoryWithSubCategory extends Category {
  subCategory: {
    id: string;
    name: string;
  } | null;
}

export function InventoryFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: InventoryFormModalProps) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    categoryId: "",
    code: "",
    providerCost: "",
  });
  const [categories, setCategories] = useState<CategoryWithSubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories and populate form when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();

      // Populate form with item data if editing
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          stock: item.stock.toString(),
          price: item.price.toString(),
          categoryId: item.categoryId,
          code: item.code,
          providerCost: item.providerCost.toString(),
        });
      } else {
        // Reset form if creating new item
        setFormData({
          name: "",
          description: "",
          stock: "",
          price: "",
          categoryId: "",
          code: "",
          providerCost: "",
        });
      }
    }
  }, [open, item]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const result = await response.json();
      setCategories(result.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = isEditMode ? { ...formData, id: item.id } : formData;

      const response = await fetch("/api/inventory", {
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
            `Failed to ${isEditMode ? "update" : "create"} inventory`
        );
      }

      setSuccess(
        `Inventory item ${isEditMode ? "updated" : "created"} successfully!`
      );

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Update Inventory Item" : "Add Inventory Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details of the inventory item."
              : "Fill in the details to add a new inventory item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="Enter item code"
            />

            <CustomInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter item name"
            />
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
              placeholder="Enter item description"
              className="custom-input min-h-[80px]"
              rows={3}
            />
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
                ? "Update Item"
                : "Create Item"}
            </CustomButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
