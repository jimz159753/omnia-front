import { useState, useEffect } from "react";
import { Category, SubCategory, Provider } from "@/generated/prisma";
import { ProductWithCategory } from "@/app/(dashboard)/dashboard/products/columns";
import { productSchema } from "@/lib/validations/product";
import { z } from "zod";

interface CategoryWithSubCategory extends Category {
  subCategory: {
    id: string;
    name: string;
  } | null;
}

interface UseProductFormProps {
  open: boolean;
  item?: ProductWithCategory | null;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useProductForm({
  open,
  item,
  onSuccess,
  onOpenChange,
}: UseProductFormProps) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stock: "",
    price: "",
    categoryId: "",
    subCategoryId: "",
    providerId: "",
    sku: "",
    cost: "",
    image: "",
  });
  const [categories, setCategories] = useState<CategoryWithSubCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch categories and populate form when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSubCategories();
      fetchProviders();

      // Populate form with item data if editing
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          stock: item.stock.toString(),
          price: item.price.toString(),
          categoryId: item.categoryId ?? "",
          subCategoryId: item.subCategoryId ?? "",
          providerId: item.providerId,
          sku: item.sku,
          cost: item.cost.toString(),
          image: item.image ?? "",
        });
      } else {
        // Reset form if creating new item
        setFormData({
          name: "",
          description: "",
          stock: "",
          price: "",
          categoryId: "",
          subCategoryId: "",
          providerId: "",
          sku: "",
          cost: "",
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

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/providers");
      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }
      const result = await response.json();
      setProviders(result.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError("Failed to load providers");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "categoryId") {
        return { ...prev, categoryId: value, subCategoryId: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      if (name === "categoryId") {
        return { ...prev, categoryId: value, subCategoryId: "" };
      }
      return { ...prev, [name]: value };
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
      const validatedData = productSchema.parse(formData);

      const payload = isEditMode
        ? { ...validatedData, id: item.id }
        : validatedData;

      const response = await fetch("/api/products", {
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
            `Failed to ${isEditMode ? "update" : "create"} product`
        );
      }

      setSuccess(
        `Product ${isEditMode ? "updated" : "created"} successfully!`
      );

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
    loading,
    error,
    success,
    fieldErrors,
    handleSelectChange,
    subCategories,
    providers,
    handleChange,
    handleSubmit,
  };
}

