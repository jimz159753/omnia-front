"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  item: ServiceWithRelations | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  item,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation("services");
  
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteService") || "Delete Service"}</DialogTitle>
          <DialogDescription>
            {t("confirmDeleteMessage") || `Are you sure you want to delete the service "${item.name}"? This action cannot be undone.`}
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
            {t("deleteService") || "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

