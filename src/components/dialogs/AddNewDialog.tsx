"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddNewButtons } from "./AddNewButtons";
import { useTranslation } from "@/hooks/useTranslation";
import { FiPlus } from "react-icons/fi";

interface AddNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}

export function AddNewDialog({
  open,
  onOpenChange,
  onSelect,
}: AddNewDialogProps) {
  const { t } = useTranslation("common");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl bg-omnia-light border-omnia-navy/20">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-omnia-dark to-omnia-navy p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FiPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {t("addNew")}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm">
                {t("addNewDescription")}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-8 bg-omnia-light/50">
          <AddNewButtons
            onSelect={(value) => {
              onSelect(value);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
