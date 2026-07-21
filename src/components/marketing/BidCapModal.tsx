"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BidCapModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: number) => void;
  count: number;
}

export function BidCapModal({
  isOpen,
  onOpenChange,
  onConfirm,
  count,
}: BidCapModalProps) {
  const [bidValue, setBidValue] = useState<string>("");

  const handleConfirm = () => {
    const numericValue = parseFloat(bidValue.replace(",", "."));
    if (!isNaN(numericValue) && numericValue >= 0) {
      onConfirm(numericValue);
      setBidValue(""); // Reset for next time
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-foreground">
            Alterar Bid Cap
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-4">
          <label className="text-xs font-medium text-muted-foreground">
            Valor (BRL)
          </label>
          <Input
            type="number"
            placeholder="Insira um valor (BRL)"
            value={bidValue}
            onChange={(e) => setBidValue(e.target.value)}
            className="h-9 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted text-foreground h-9 text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"
          >
            Publicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
