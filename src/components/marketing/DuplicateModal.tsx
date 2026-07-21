"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Facebook } from "lucide-react"; // Importando a logo do Meta/Facebook
import { cn } from "@/lib/utils";

// Strict typings
type AdAccountOption = { id: string; name: string };

interface DuplicateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    mode: "same" | "other";
    targetAccountId?: string;
    copiesCount: number;
  }) => void;
  adAccounts: AdAccountOption[];
  count: number;
}

export function DuplicateModal({
  isOpen,
  onOpenChange,
  onConfirm,
  adAccounts,
  count,
}: DuplicateModalProps) {
  const [duplicateMode, setDuplicateMode] = useState<"same" | "other">("same");
  const [copiesCount, setCopiesCount] = useState<number>(1);
  const [targetAccountId, setTargetAccountId] = useState<string>("");

  const handleConfirm = () => {
    onConfirm({
      mode: duplicateMode,
      targetAccountId: duplicateMode === "other" ? targetAccountId : undefined,
      copiesCount: copiesCount,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Duplique sua campanha
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Escolha como você quer duplicar sua campanha.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Options Selection */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setDuplicateMode("same")}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                duplicateMode === "same"
                  ? "bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-500"
                  : "bg-transparent border-border text-muted-foreground hover:border-border/80",
              )}
            >
              <span className="text-sm font-medium mb-1">
                Mesma Conta de Anúncio
              </span>
              <span className="text-xs opacity-80">
                Sua campanha será duplicada na mesma conta de anúncio a que
                pertence.
              </span>
            </button>

            <button
              onClick={() => setDuplicateMode("other")}
              className={cn(
                "flex flex-col items-start p-3 rounded-lg border transition-all text-left",
                duplicateMode === "other"
                  ? "bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-500"
                  : "bg-transparent border-border text-muted-foreground hover:border-border/80",
              )}
            >
              <span className="text-sm font-medium mb-1">
                Outra Conta de Anúncio
              </span>
              <span className="text-xs opacity-80">
                Sua campanha será duplicada em outra conta de anúncio que você
                escolher.
              </span>
            </button>
          </div>

          {/* Account Selector */}
          {duplicateMode === "other" && (
            <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in duration-200">
              <label className="text-xs font-medium text-muted-foreground">
                Escolha a Conta de Anúncio
              </label>
              <Select
                value={targetAccountId}
                onValueChange={setTargetAccountId}
              >
                <SelectTrigger className="w-full h-9 bg-background border-border focus:ring-blue-600">
                  <SelectValue placeholder="Selecione a conta..." />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  {adAccounts.map((acc) => (
                    <SelectItem
                      key={acc.id}
                      value={acc.id}
                      className="focus:bg-blue-500/10 focus:text-blue-600 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span>{acc.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Copies Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Quantidade de cópias
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={copiesCount}
              onChange={(e) => setCopiesCount(Number(e.target.value))}
              className="h-9 bg-background border-border text-foreground focus-visible:ring-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={duplicateMode === "other" && !targetAccountId}
          >
            Duplicar {count > 1 ? `(${count})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
