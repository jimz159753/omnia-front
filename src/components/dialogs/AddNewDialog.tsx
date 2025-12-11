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
      <DialogContent className="flex flex-col items-start justify-around gap-8">
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle className="text-2xl font-normal">{t("addNew")}</DialogTitle>
          <DialogDescription>
            {t("addNewDescription")}
          </DialogDescription>
        </DialogHeader>
        <AddNewButtons
          onSelect={(value) => {
            onSelect(value);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
