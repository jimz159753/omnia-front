import { useEffect, useState } from "react";
import { toast } from "sonner";

type CategoryOption = {
  id: string;
  name: string;
  subCategory?: { id: string; name: string } | null;
};

type ProviderForm = {
  name: string;
  ownerName: string;
  description: string;
};

type CategoryForm = {
  name: string;
  description: string;
};

type SubCategoryForm = {
  name: string;
  description: string;
  categoryId: string;
};

export const useProductMeta = () => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);

  const [providerForm, setProviderForm] = useState<ProviderForm>({
    name: "",
    ownerName: "",
    description: "",
  });

  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    description: "",
  });

  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryForm>({
    name: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleCreateProvider = async () => {
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create provider");
      }
      toast.success("Provider created");
      setProviderModalOpen(false);
      setProviderForm({ name: "", ownerName: "", description: "" });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create provider"
      );
    }
  };

  const handleCreateCategory = async () => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      const updated = await res.json();
      toast.success("Category created");
      setCategoryModalOpen(false);
      setCategoryForm({ name: "", description: "" });
      setCategories((prev) => [...prev, updated.data]);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleCreateSubCategory = async () => {
    try {
      const res = await fetch("/api/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subCategoryForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create subcategory");
      }
      toast.success("Subcategory created");
      setSubCategoryModalOpen(false);
      setSubCategoryForm({ name: "", description: "", categoryId: "" });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subcategory"
      );
    }
  };

  return {
    categories,
    providerModalOpen,
    categoryModalOpen,
    subCategoryModalOpen,
    providerForm,
    categoryForm,
    subCategoryForm,
    setProviderModalOpen,
    setCategoryModalOpen,
    setSubCategoryModalOpen,
    setProviderForm,
    setCategoryForm,
    setSubCategoryForm,
    handleCreateProvider,
    handleCreateCategory,
    handleCreateSubCategory,
  };
};

