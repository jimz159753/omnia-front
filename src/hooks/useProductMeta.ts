import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export type Provider = {
  id: string;
  name: string;
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  subCategories?: SubCategory[];
};

export type SubCategory = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
};

type ProviderForm = {
  id?: string;
  name: string;
};

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
};

type SubCategoryForm = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
};

export const useProductMeta = () => {
  // Data lists
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  // Loading states
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Modal states
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subCategoryModalOpen, setSubCategoryModalOpen] = useState(false);

  // Form states
  const [providerForm, setProviderForm] = useState<ProviderForm>({
    name: "",
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

  // Editing states
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await fetch("/api/providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.data || []);
      }
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch subcategories
  const fetchSubCategories = useCallback(async () => {
    setLoadingSubCategories(true);
    try {
      const res = await fetch("/api/subcategories");
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data.data || []);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
    } finally {
      setLoadingSubCategories(false);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load providers when modal opens
  useEffect(() => {
    if (providerModalOpen) {
      fetchProviders();
    }
  }, [providerModalOpen, fetchProviders]);

  // Load categories when modal opens
  useEffect(() => {
    if (categoryModalOpen) {
      fetchCategories();
    }
  }, [categoryModalOpen, fetchCategories]);

  // Load subcategories and categories when modal opens
  useEffect(() => {
    if (subCategoryModalOpen) {
      fetchSubCategories();
      fetchCategories(); // Ensure categories are loaded for the dropdown
    }
  }, [subCategoryModalOpen, fetchSubCategories, fetchCategories]);

  // Provider CRUD
  const handleCreateProvider = async () => {
    try {
      if (!providerForm.name.trim()) {
        toast.error("Name is required");
        return;
      }
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: providerForm.name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create provider");
      }
      toast.success("Provider created");
      setProviderForm({ name: "" });
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create provider"
      );
    }
  };

  const handleUpdateProvider = async () => {
    try {
      if (!editingProvider?.id || !providerForm.name.trim()) {
        toast.error("Name is required");
        return;
      }
      const res = await fetch(`/api/providers?id=${editingProvider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: providerForm.name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update provider");
      }
      toast.success("Provider updated");
      setEditingProvider(null);
      setProviderForm({ name: "" });
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update provider"
      );
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const res = await fetch(`/api/providers?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : {};
        throw new Error(err.error || "Failed to delete provider");
      }
      toast.success("Provider deleted");
      fetchProviders();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete provider"
      );
    }
  };

  const startEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setProviderForm({ name: provider.name });
  };

  const cancelEditProvider = () => {
    setEditingProvider(null);
    setProviderForm({ name: "" });
  };

  // Category CRUD
  const handleCreateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast.error("Name is required");
        return;
      }
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
      setCategoryForm({ name: "", description: "" });
      setCategories((prev) => [...prev, updated.data]);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory?.id || !categoryForm.name.trim()) {
        toast.error("Name is required");
        return;
      }
      const res = await fetch(`/api/categories?id=${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
      }
      toast.success("Category updated");
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : {};
        throw new Error(err.error || "Failed to delete category");
      }
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, description: category.description || "" });
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  // SubCategory CRUD
  const handleCreateSubCategory = async () => {
    try {
      if (!subCategoryForm.name.trim() || !subCategoryForm.categoryId) {
        toast.error("Name and category are required");
        return;
      }
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
      setSubCategoryForm({ name: "", description: "", categoryId: "" });
      fetchSubCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subcategory"
      );
    }
  };

  const handleUpdateSubCategory = async () => {
    try {
      if (!editingSubCategory?.id || !subCategoryForm.name.trim()) {
        toast.error("Name is required");
        return;
      }
      const res = await fetch(`/api/subcategories?id=${editingSubCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subCategoryForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update subcategory");
      }
      toast.success("Subcategory updated");
      setEditingSubCategory(null);
      setSubCategoryForm({ name: "", description: "", categoryId: "" });
      fetchSubCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update subcategory"
      );
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/subcategories?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : {};
        throw new Error(err.error || "Failed to delete subcategory");
      }
      toast.success("Subcategory deleted");
      fetchSubCategories();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete subcategory"
      );
    }
  };

  const startEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      description: subCategory.description || "",
      categoryId: subCategory.categoryId,
    });
  };

  const cancelEditSubCategory = () => {
    setEditingSubCategory(null);
    setSubCategoryForm({ name: "", description: "", categoryId: "" });
  };

  return {
    // Data
    providers,
    categories,
    subCategories,

    // Loading states
    loadingProviders,
    loadingCategories,
    loadingSubCategories,

    // Modal states
    providerModalOpen,
    categoryModalOpen,
    subCategoryModalOpen,
    setProviderModalOpen,
    setCategoryModalOpen,
    setSubCategoryModalOpen,

    // Form states
    providerForm,
    categoryForm,
    subCategoryForm,
    setProviderForm,
    setCategoryForm,
    setSubCategoryForm,

    // Editing states
    editingProvider,
    editingCategory,
    editingSubCategory,

    // Provider actions
    handleCreateProvider,
    handleUpdateProvider,
    handleDeleteProvider,
    startEditProvider,
    cancelEditProvider,

    // Category actions
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    startEditCategory,
    cancelEditCategory,

    // SubCategory actions
    handleCreateSubCategory,
    handleUpdateSubCategory,
    handleDeleteSubCategory,
    startEditSubCategory,
    cancelEditSubCategory,

    // Refresh functions
    fetchProviders,
    fetchCategories,
    fetchSubCategories,
  };
};
