"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { SubCategory, Category } from "@/hooks/useProductMeta";
import { useTranslation } from "@/hooks/useTranslation";

interface SubCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategories: SubCategory[];
  categories: Category[];
  loading: boolean;
  subCategoryForm: { name: string; description: string; categoryId: string };
  setSubCategoryForm: (form: { name: string; description: string; categoryId: string }) => void;
  editingSubCategory: SubCategory | null;
  onCreateSubCategory: () => void;
  onUpdateSubCategory: () => void;
  onDeleteSubCategory: (id: string) => void;
  onStartEdit: (subCategory: SubCategory) => void;
  onCancelEdit: () => void;
}

export function SubCategoriesDialog({
  open,
  onOpenChange,
  subCategories,
  categories,
  loading,
  subCategoryForm,
  setSubCategoryForm,
  editingSubCategory,
  onCreateSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,
  onStartEdit,
  onCancelEdit,
}: SubCategoriesDialogProps) {
  const { t } = useTranslation("products");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubCategory) {
      onUpdateSubCategory();
    } else {
      onCreateSubCategory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("subcategories") || "SubCategories"}</DialogTitle>
        </DialogHeader>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3 border-b pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("name") || "Name"} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={subCategoryForm.name}
                onChange={(e) =>
                  setSubCategoryForm({
                    name: e.target.value,
                    description: subCategoryForm.description,
                    categoryId: subCategoryForm.categoryId,
                  })
                }
                placeholder={t("subcategoryName") || "SubCategory name"}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("productDescription") || "Description"}
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={subCategoryForm.description}
                onChange={(e) =>
                  setSubCategoryForm({
                    name: subCategoryForm.name,
                    description: e.target.value,
                    categoryId: subCategoryForm.categoryId,
                  })
                }
                placeholder={t("subcategoryDescription") || "SubCategory description"}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("category") || "Category"} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={subCategoryForm.categoryId}
                onChange={(e) => {
                  const newCategoryId = e.target.value;
                  setSubCategoryForm({
                    name: subCategoryForm.name,
                    description: subCategoryForm.description,
                    categoryId: newCategoryId,
                  });
                }}
              >
                <option value="">{t("selectCategory") || "Select category"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingSubCategory && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                {t("cancel") || "Cancel"}
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center gap-2"
            >
              {editingSubCategory ? (
                <>
                  <FiEdit2 className="w-4 h-4" />
                  {t("update") || "Update"}
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  {t("add") || "Add"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : subCategories.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("noSubcategoriesFound") || "No subcategories found. Add your first subcategory above."}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    {t("name") || "Name"}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    {t("productDescription") || "Description"}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    {t("category") || "Category"}
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-24">
                    {t("actions") || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subCategories.map((subCategory) => (
                  <tr
                    key={subCategory.id}
                    className={`hover:bg-gray-50 ${
                      editingSubCategory?.id === subCategory.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {subCategory.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {subCategory.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                        {subCategory.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onStartEdit(subCategory)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title={t("editProduct") || "Edit"}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("confirmDeleteSubcategory") || "Are you sure you want to delete this subcategory?")) {
                              onDeleteSubCategory(subCategory.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={t("deleteProduct") || "Delete"}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {subCategories.length} {subCategories.length !== 1 ? t("subcategoriesCount") || "subcategories" : t("subcategoryCount") || "subcategory"}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {t("close") || "Close"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
