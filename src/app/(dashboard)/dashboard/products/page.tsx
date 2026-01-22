"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, ProductWithCategory } from "./columns";
import { useProducts } from "@/hooks/useProducts";
import { useProductMeta } from "@/hooks/useProductMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductFormModal } from "../../../../components/products/ProductFormModal";
import { DeleteConfirmDialog } from "../../../../components/products/DeleteConfirmDialog";
import { ProvidersDialog } from "../../../../components/products/ProvidersDialog";
import { CategoriesDialog } from "../../../../components/products/CategoriesDialog";
import { SubCategoriesDialog } from "../../../../components/products/SubCategoriesDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiBox,
  FiPackage,
  FiTrendingUp,
  FiPlus,
  FiLayers,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

// Types for form state setters
type ProviderFormSetter = (form: { name: string }) => void;
type CategoryFormSetter = (form: { name: string; description: string }) => void;
type SubCategoryFormSetter = (form: { name: string; description: string; categoryId: string }) => void;

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductWithCategory | null>(
    null
  );
  const [deletingItem, setDeletingItem] = useState<ProductWithCategory | null>(
    null
  );
  const {
    data,
    loading,
    pagination,
    searchQuery,
    handlePageChange,
    handleSearch,
    refetch,
  } = useProducts();

  const {
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
  } = useProductMeta();

  const { t: tProducts } = useTranslation("products");
  const { t: tCommon } = useTranslation();

  if (loading && data.length === 0) {
    return (
      <>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[100px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[140px]" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </>
    );
  }

  const handleAddNewSuccess = () => {
    refetch();
    setEditingItem(null);
  };

  const handleUpdate = (item: ProductWithCategory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: ProductWithCategory) => {
    setDeletingItem(item);
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;

    fetch(`/api/products?id=${deletingItem.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete product");
        }
        refetch();
        setDeletingItem(null);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const columns = getColumns({
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    tProducts,
    tCommon,
  });

  // Calculate statistics from products data
  const totalProducts = pagination.total || 0;
  const lowStockItems = data.filter((product) => product.stock <= 10).length;
  const warehouseValue = data.reduce(
    (sum, product) => sum + product.stock * product.cost,
    0
  );
  const totalValue = data.reduce(
    (sum, product) => sum + product.stock * product.price,
    0
  );

  const squareCards = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: <FiShoppingBag className="w-4 h-4" />,
    },

    {
      title: "Low Stock Items",
      value: lowStockItems.toString(),
      icon: <FiBox className="w-4 h-4" />,
    },

    {
      title: "Warehouse Value",
      value: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(warehouseValue),
      icon: <FiPackage className="w-4 h-4" />,
    },
    {
      title: "Total Value",
      value: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(totalValue),
      icon: <FiTrendingUp className="w-4 h-4" />,
    },
  ];

  const buttons = [
    {
      title: "Providers",
      icon: <FiUsers className="w-4 h-4 text-black" />,
      onClick: () => setProviderModalOpen(true),
    },
    {
      title: "Categories",
      icon: <FiLayers className="w-4 h-4 text-black" />,
      onClick: () => setCategoryModalOpen(true),
    },
    {
      title: "SubCategories",
      icon: <FiLayers className="w-4 h-4 text-black" />,
      onClick: () => setSubCategoryModalOpen(true),
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-normal">{tProducts("title")}</p>
          <p className="text-sm text-gray-500">{tProducts("description")}</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-md rounded-md border bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          {tProducts("addProduct")}
        </button>
      </div>
      <div className="flex gap-4 w-1/2 py-4">
        {buttons.map((button) => (
          <button
            key={button.title}
            className="w-fit border border-brand-500 flex justify-center items-center gap-2 px-4 py-1 text-md rounded-md hover:bg-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={button.onClick}
          >
            {button.icon}
            <p className="text-black">{button.title}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {squareCards.map((card) => (
          <Card className="bg-brand-500/10 shadow-none" key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search by name, SKU, or category..."
        searchValue={searchQuery}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        loading={loading}
      />

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleAddNewSuccess}
        item={editingItem}
      />

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        item={deletingItem}
      />

      {/* Provider Dialog */}
      <ProvidersDialog
        open={providerModalOpen}
        onOpenChange={setProviderModalOpen}
        providers={providers}
        loading={loadingProviders}
        providerForm={providerForm}
        setProviderForm={setProviderForm}
        editingProvider={editingProvider}
        onCreateProvider={handleCreateProvider}
        onUpdateProvider={handleUpdateProvider}
        onDeleteProvider={handleDeleteProvider}
        onStartEdit={startEditProvider}
        onCancelEdit={cancelEditProvider}
      />

      {/* Category Dialog */}
      <CategoriesDialog
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        categories={categories}
        loading={loadingCategories}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        editingCategory={editingCategory}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onStartEdit={startEditCategory}
        onCancelEdit={cancelEditCategory}
      />

      {/* SubCategory Dialog */}
      <SubCategoriesDialog
        open={subCategoryModalOpen}
        onOpenChange={setSubCategoryModalOpen}
        subCategories={subCategories}
        categories={categories}
        loading={loadingSubCategories}
        subCategoryForm={subCategoryForm}
        setSubCategoryForm={setSubCategoryForm}
        editingSubCategory={editingSubCategory}
        onCreateSubCategory={handleCreateSubCategory}
        onUpdateSubCategory={handleUpdateSubCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
        onStartEdit={startEditSubCategory}
        onCancelEdit={cancelEditSubCategory}
      />
    </>
  );
};

export default Products;
