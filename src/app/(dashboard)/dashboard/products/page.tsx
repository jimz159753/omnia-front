"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, ProductWithCategory } from "./columns";
import { useProducts } from "@/hooks/useProducts";
import { useProductMeta } from "@/hooks/useProductMeta";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { DeleteConfirmDialog } from "@/components/products/DeleteConfirmDialog";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FiBox,
  FiPackage,
  FiTrendingUp,
  FiPlus,
  FiLayers,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";

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
  } = useProductMeta();

  if (loading && data.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <CustomLoadingSpinner size={48} />
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

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    const response = await fetch(`/api/products?id=${deletingItem.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete product");
    }

    refetch();
    setDeletingItem(null);
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-4xl font-normal">Products</CardTitle>
              <CardDescription className="font-normal">
                Manage your products and stock levels
              </CardDescription>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-1 text-md rounded-md bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 w-1/2 py-4">
            {buttons.map((button) => (
              <button
                key={button.title}
                className="w-fit border border-gray-300 flex justify-center items-center gap-2 px-4 py-1 text-md rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                onClick={button.onClick}
              >
                {button.icon}
                <p className="text-black">{button.title}</p>
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {squareCards.map((card) => (
              <Card className="bg-brand-500/10" key={card.title}>
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
            searchPlaceholder="Search by name..."
            searchValue={searchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </CardContent>
      </Card>

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
        itemName={deletingItem?.name || ""}
      />

      {/* Provider Modal */}
      <Dialog open={providerModalOpen} onOpenChange={setProviderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Provider</DialogTitle>
            <DialogDescription>Register a new provider.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="prov-name"
              >
                Name
              </label>
              <input
                id="prov-name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={providerForm.name}
                onChange={(e) =>
                  setProviderForm((p: typeof providerForm) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
                placeholder="Provider name"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="prov-owner"
              >
                Owner Name
              </label>
              <input
                id="prov-owner"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={providerForm.ownerName}
                onChange={(e) =>
                  setProviderForm((p: typeof providerForm) => ({
                    ...p,
                    ownerName: e.target.value,
                  }))
                }
                placeholder="Owner name"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="prov-desc"
              >
                Description
              </label>
              <textarea
                id="prov-desc"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                value={providerForm.description}
                onChange={(e) =>
                  setProviderForm((p: typeof providerForm) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Provider description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setProviderModalOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateProvider}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Register a new category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="cat-name"
              >
                Name
              </label>
              <input
                id="cat-name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm((p: typeof categoryForm) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
                placeholder="Category name"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="cat-desc"
              >
                Description
              </label>
              <textarea
                id="cat-desc"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((p: typeof categoryForm) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Category description"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateCategory}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SubCategory Modal */}
      <Dialog
        open={subCategoryModalOpen}
        onOpenChange={setSubCategoryModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SubCategory</DialogTitle>
            <DialogDescription>
              Register a new subcategory under an existing category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="sub-name"
              >
                Name
              </label>
              <input
                id="sub-name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm((p: typeof subCategoryForm) => ({
                    ...p,
                    name: e.target.value,
                  }))
                }
                placeholder="Subcategory name"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="sub-desc"
              >
                Description
              </label>
              <textarea
                id="sub-desc"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                value={subCategoryForm.description}
                onChange={(e) =>
                  setSubCategoryForm((p: typeof subCategoryForm) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="Subcategory description"
              />
            </div>
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="sub-cat"
              >
                Category
              </label>
              <select
                id="sub-cat"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={subCategoryForm.categoryId}
                onChange={(e) =>
                  setSubCategoryForm((p: typeof subCategoryForm) => ({
                    ...p,
                    categoryId: e.target.value,
                  }))
                }
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setSubCategoryModalOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSubCategory}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
