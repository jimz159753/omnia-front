"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, ProductWithCategory } from "./columns";
import { useProducts } from "@/hooks/useProducts";
import { useProductMeta } from "@/hooks/useProductMeta";
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
  FiGrid,
} from "react-icons/fi";
import { useTranslation } from "@/hooks/useTranslation";

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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </div>
            <Skeleton className="h-11 w-[160px] rounded-xl" />
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[130px] rounded-xl" />
          ))}
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
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
  const lowStockItems = data.filter((product) => product.stock <= (product.minStock || 10)).length;
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
      title: tProducts("totalProducts") || "Total Products",
      value: totalProducts.toString(),
      icon: <FiShoppingBag className="w-5 h-5" />,
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      title: tProducts("lowStockItems") || "Low Stock Items",
      value: lowStockItems.toString(),
      icon: <FiBox className="w-5 h-5" />,
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      title: tProducts("warehouseValue") || "Warehouse Value",
      value: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(warehouseValue),
      icon: <FiPackage className="w-5 h-5" />,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: tProducts("totalValue") || "Total Value",
      value: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(totalValue),
      icon: <FiTrendingUp className="w-5 h-5" />,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      title: tProducts("providers") || "Providers",
      icon: <FiUsers className="w-4 h-4" />,
      onClick: () => setProviderModalOpen(true),
      count: providers.length,
    },
    {
      title: tProducts("categories") || "Categories",
      icon: <FiLayers className="w-4 h-4" />,
      onClick: () => setCategoryModalOpen(true),
      count: categories.length,
    },
    {
      title: tProducts("subcategories") || "SubCategories",
      icon: <FiGrid className="w-4 h-4" />,
      onClick: () => setSubCategoryModalOpen(true),
      count: subCategories.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tProducts("title")}
            </h1>
            <p className="text-gray-500 mt-1">{tProducts("description")}</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-omnia-blue text-white font-medium hover:bg-omnia-blue/90 transition-all shadow-lg shadow-omnia-blue/25 hover:shadow-xl hover:shadow-omnia-blue/30 hover:-translate-y-0.5"
          >
            <FiPlus className="w-5 h-5" />
            {tProducts("addProduct")}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-omnia-blue/50 transition-all group"
          >
            <span className="text-gray-500 group-hover:text-omnia-blue transition-colors">
              {action.icon}
            </span>
            {action.title}
            {action.count > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full group-hover:bg-omnia-blue/10 group-hover:text-omnia-blue transition-colors">
                {action.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {squareCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.lightColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6">
          <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder={
              tProducts("searchPlaceholder") || "Search by name, SKU, or category..."
            }
            searchValue={searchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

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
    </div>
  );
};

export default Products;
