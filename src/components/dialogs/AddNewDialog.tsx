"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddNewButtons } from "./AddNewButtons";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-start justify-around gap-8">
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle className="text-2xl font-normal">Add New</DialogTitle>
          <DialogDescription>
            Choose the type of item you want to add.
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
