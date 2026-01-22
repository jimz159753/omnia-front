"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { Category } from "@/hooks/useProductMeta";

interface CategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  loading: boolean;
  categoryForm: { name: string; description: string };
  setCategoryForm: (form: { name: string; description: string }) => void;
  editingCategory: Category | null;
  onCreateCategory: () => void;
  onUpdateCategory: () => void;
  onDeleteCategory: (id: string) => void;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
}

export function CategoriesDialog({
  open,
  onOpenChange,
  categories,
  loading,
  categoryForm,
  setCategoryForm,
  editingCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onStartEdit,
  onCancelEdit,
}: CategoriesDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      onUpdateCategory();
    } else {
      onCreateCategory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Categories</DialogTitle>
        </DialogHeader>

        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3 border-b pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Category name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, description: e.target.value })
                }
                placeholder="Category description"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingCategory && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center gap-2"
            >
              {editingCategory ? (
                <>
                  <FiEdit2 className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  Add
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
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No categories found. Add your first category above.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">
                    Subcategories
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-gray-50 ${
                      editingCategory?.id === category.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {category.description || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.subCategories?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onStartEdit(category)}
                          className="p-1.5 rounded-md text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this category? This will also delete all its subcategories.")) {
                              onDeleteCategory(category.id);
                            }
                          }}
                          className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
