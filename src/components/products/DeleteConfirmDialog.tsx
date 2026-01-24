"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductWithCategory } from "@/app/(dashboard)/dashboard/products/columns";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  item: ProductWithCategory | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  item,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation("products");

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteProduct") || "Delete Product"}</DialogTitle>
          <DialogDescription>
            {t("confirmDeleteProduct") || `Are you sure you want to delete the product "${item.name}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {t("deleteProduct") || "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

