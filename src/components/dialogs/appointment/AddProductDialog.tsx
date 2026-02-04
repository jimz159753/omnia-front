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
  products: Array<{ id: string; name: string; cost: number; isClassPackage?: boolean }>;
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
      <DialogContent className="max-w-md p-0 gap-0 [&>button]:hidden overflow-hidden rounded-2xl">
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className="sr-only">Agregar Producto</DialogTitle>

        <div className="flex flex-col">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agregar Producto</h2>
                  <p className="text-white/70 text-sm">Productos o paquetes de clases</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {/* Product Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Producto o Paquete <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
              >
                <option value="">
                  {products.length === 0
                    ? "No hay productos disponibles"
                    : "Seleccionar producto o paquete..."}
                </option>
                {products.filter(p => !p.isClassPackage).length > 0 && (
                  <optgroup label="📦 Productos">
                    {products.filter(p => !p.isClassPackage).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.cost.toLocaleString()}
                      </option>
                    ))}
                  </optgroup>
                )}
                {products.filter(p => p.isClassPackage).length > 0 && (
                  <optgroup label="📚 Paquetes de Clases">
                    {products.filter(p => p.isClassPackage).map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.cost.toLocaleString()}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {/* Selected product preview */}
              {selectedProduct && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    {products.find(p => p.id === selectedProduct)?.isClassPackage ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        Paquete
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Producto
                      </span>
                    )}
                    <span className="font-medium text-gray-800">
                      {products.find(p => p.id === selectedProduct)?.name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Staff Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Adjudicado a <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
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
          <div className="flex items-center justify-end gap-3 p-5 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl border-2 hover:bg-gray-100 font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 flex items-center gap-2"
              disabled={!selectedStaff || !selectedProduct}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

