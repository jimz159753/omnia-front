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
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-md bg-omnia-light border-omnia-navy/20 p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <FiAlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-omnia-dark">
                {t("deleteService") || "Delete Service"}
              </DialogTitle>
              <DialogDescription className="text-omnia-navy/70 mt-2">
                {t("confirmDeleteMessage") || `Are you sure you want to delete the service "${item.name}"? This action cannot be undone.`}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className="bg-gray-50/50 p-4 gap-3 flex flex-row justify-center sm:justify-center border-t border-omnia-navy/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 max-w-[140px] h-11 rounded-xl border-omnia-navy/10 text-omnia-dark hover:bg-white"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 max-w-[140px] h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
          >
            {t("deleteService") || "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
