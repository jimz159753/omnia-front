"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiX } from "react-icons/fi";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (data: {
    staffId: string;
    productId: string;
  }) => void;
  users: Array<{ id: string; email: string; name?: string }>;
  products: Array<{ id: string; name: string; cost: number }>;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onAddProduct,
  users,
  products,
}: AddProductDialogProps) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const handleAdd = () => {
    if (!selectedStaff || !selectedProduct) {
      return;
    }

    onAddProduct({
      staffId: selectedStaff,
      productId: selectedProduct,
    });

    // Reset form
    setSelectedStaff("");
    setSelectedProduct("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setSelectedStaff("");
    setSelectedProduct("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 [&>button]:hidden">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Agregar Producto</DialogTitle>

        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Agregar Producto</h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Product Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Producto <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">
                  {products.length === 0
                    ? "No hay productos disponibles"
                    : "Seleccionar producto..."}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.cost}
                  </option>
                ))}
              </select>
            </div>

            {/* Staff Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Adjudicado a <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Seleccionar staff...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              className="px-6 bg-brand-500 hover:bg-brand-600 text-white"
              disabled={!selectedStaff || !selectedProduct}
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

