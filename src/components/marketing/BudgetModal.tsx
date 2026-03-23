"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: number) => void;
  count: number; // Quantos itens estão sendo editados
}

export function BudgetModal({
  open,
  onOpenChange,
  onConfirm,
  count,
}: BudgetModalProps) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onConfirm(numValue);
      setValue(""); // Limpa
      onOpenChange(false); // Fecha
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-card border-border text-card-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Alterar Orçamento
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Você está alterando o orçamento de{" "}
            <strong className="text-foreground">{count}</strong> itens
            selecionados.
          </p>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-xs font-medium">
              Valor (Diário ou Total)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="budget"
                type="number"
                placeholder="0,00"
                className="pl-9 bg-background border-border focus-visible:ring-blue-600"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!value}
          >
            Publicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
