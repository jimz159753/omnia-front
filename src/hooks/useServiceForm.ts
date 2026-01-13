import { useState, useEffect } from "react";
import { Category, SubCategory } from "@/generated/prisma";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { serviceSchema } from "@/lib/validations/service";
import { z } from "zod";

interface CategoryWithSubCategory extends Category {
  subCategory: {
    id: string;
    name: string;
  } | null;
}

interface UseServiceFormProps {
  open: boolean;
  item?: ServiceWithRelations | null;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useServiceForm({
  open,
  item,
  onSuccess,
  onOpenChange,
}: UseServiceFormProps) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    commission: "",
    duration: "",
    categoryId: "",
    subCategoryId: "",
    image: "",
  });
  const [categories, setCategories] = useState<CategoryWithSubCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch categories and subcategories when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSubCategories();

      // Populate form with item data if editing
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          commission: item.commission.toString(),
          duration: item.duration.toString(),
          categoryId: item.categoryId ?? "",
          subCategoryId: item.subCategoryId ?? "",
          image: item.image || "",
        });
      } else {
        // Reset form if creating new item
        setFormData({
          name: "",
          description: "",
          price: "",
          commission: "",
          duration: "",
          categoryId: "",
          subCategoryId: "",
          image: "",
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

  const fetchSubCategories = async () => {
    try {
      const response = await fetch("/api/subcategories");
      if (!response.ok) {
        throw new Error("Failed to fetch subcategories");
      }
      const result = await response.json();
      setSubCategories(result.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setError("Failed to load subcategories");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear subcategory if category changes
      if (name === "categoryId") {
        updated.subCategoryId = "";
      }
      return updated;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear subcategory if category changes
      if (name === "categoryId") {
        updated.subCategoryId = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = serviceSchema.parse(formData);

      const payload = isEditMode
        ? { ...validatedData, id: item.id }
        : validatedData;

      const response = await fetch("/api/services", {
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
            `Failed to ${isEditMode ? "update" : "create"} service`
        );
      }

      setSuccess(`Service ${isEditMode ? "updated" : "created"} successfully!`);

      // Close modal and refresh data
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFieldErrors(errors);
        setError("Please fix the validation errors below");
      } else {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
