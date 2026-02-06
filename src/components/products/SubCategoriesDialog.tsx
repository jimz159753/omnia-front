"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiList } from "react-icons/fi";
import { SubCategory, Category } from "@/hooks/useProductMeta";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-omnia-navy/20 bg-omnia-light">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FiList className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t("subcategories") || "SubCategories"}
              </DialogTitle>
              <p className="text-white/70 text-sm">
                {t("manageSubcategoriesDesc") || "Create specific subcategories for better product organization."}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          {/* Add/Edit Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-omnia-navy/10 rounded-xl p-4 mb-6 shadow-sm space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-omnia-navy/70 uppercase tracking-wider">
                  {t("name") || "Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full h-11 rounded-xl border-2 border-omnia-navy/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                  value={subCategoryForm.name}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      name: e.target.value,
                    })
                  }
                  placeholder={t("subcategoryName") || "SubCategory name"}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-omnia-navy/70 uppercase tracking-wider">
                  {t("productDescription") || "Description"}
                </label>
                <input
                  className="w-full h-11 rounded-xl border-2 border-omnia-navy/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark"
                  value={subCategoryForm.description}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("subcategoryDescription") || "SubCategory description"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-omnia-navy/70 uppercase tracking-wider">
                  {t("category") || "Category"} <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full h-11 rounded-xl border-2 border-omnia-navy/10 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-omnia-blue focus:border-transparent transition-all bg-white text-omnia-dark appearance-none"
                  value={subCategoryForm.categoryId}
                  onChange={(e) => {
                    setSubCategoryForm({
                      ...subCategoryForm,
                      categoryId: e.target.value,
                    });
                  }}
                  required
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelEdit}
                  className="h-10 rounded-xl border-2 border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5"
                >
                  <FiX className="w-4 h-4 mr-2" />
                  {t("cancel") || "Cancel"}
                </Button>
              )}
              <Button
                type="submit"
                className="h-10 rounded-xl bg-omnia-blue hover:bg-omnia-blue/90 text-white shadow-lg shadow-omnia-blue/20 flex items-center gap-2 px-6"
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
              </Button>
            </div>
          </form>

          {/* Table */}
          <div className="flex-1 overflow-auto bg-white border border-omnia-navy/10 rounded-xl shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-omnia-blue"></div>
              </div>
            ) : subCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-omnia-blue/5 flex items-center justify-center mb-4">
                  <FiList className="w-8 h-8 text-omnia-blue/30" />
                </div>
                <h4 className="text-omnia-dark font-medium mb-1">{t("noSubcategoriesFound") || "No subcategories found"}</h4>
                <p className="text-sm text-omnia-navy/50">{t("addFirstSubcategory") || "Add your first subcategory above."}</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-omnia-light/50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider">
                      {t("name") || "Name"}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider">
                      {t("productDescription") || "Description"}
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider">
                      {t("category") || "Category"}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-omnia-navy/70 uppercase tracking-wider w-24">
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-omnia-navy/5">
                  {subCategories.map((subCategory) => (
                    <tr
                      key={subCategory.id}
                      className={`group hover:bg-omnia-blue/5 transition-colors ${
                        editingSubCategory?.id === subCategory.id ? "bg-omnia-blue/10" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-omnia-dark">
                        {subCategory.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-omnia-navy/60">
                        {subCategory.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-omnia-blue/5 text-omnia-blue uppercase tracking-tighter">
                          {subCategory.category?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onStartEdit(subCategory)}
                            className="p-2 rounded-lg text-omnia-navy/40 hover:text-omnia-blue hover:bg-omnia-blue/10 transition-all"
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
                            className="p-2 rounded-lg text-omnia-navy/40 hover:text-red-600 hover:bg-red-50 transition-all"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-omnia-navy/10 shrink-0 flex justify-between items-center">
          <span className="text-xs font-semibold text-omnia-navy/50 uppercase tracking-widest">
            {subCategories.length} {subCategories.length !== 1 ? t("subcategoriesCount") || "subcategories" : t("subcategoryCount") || "subcategory"}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-omnia-navy/10 text-omnia-dark hover:bg-omnia-navy/5 px-6"
          >
            {t("close") || "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
