"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DuplicateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    mode: "same" | "other";
    targetAccount?: string;
    copies: number;
  }) => void;
  level: string; // 'campanhas', 'conjuntos', 'anuncios'
  count: number;
}

export function DuplicateModal({
  open,
  onOpenChange,
  onConfirm,
  level,
  count,
}: DuplicateModalProps) {
  const [mode, setMode] = useState<"same" | "other">("same");
  const [targetAccount, setTargetAccount] = useState("");
  const [copies, setCopies] = useState("1");

  // Reseta o estado quando o modal abre
  useEffect(() => {
    if (open) {
      setMode("same");
      setTargetAccount("");
      setCopies("1");
    }
  }, [open]);

  // Define os textos baseados no nível
  const entityName =
    level === "campanhas"
      ? "sua campanha"
      : level === "conjuntos"
        ? "seu conjunto"
        : "seu anúncio";
  const pluralEntity =
    level === "campanhas"
      ? "campanhas"
      : level === "conjuntos"
        ? "conjuntos"
        : "anúncios";

  // Regra: Apenas campanhas podem ir para outra conta
  const canTransfer = level === "campanhas";

  const handleConfirm = () => {
    const numCopies = parseInt(copies);
    if (numCopies > 0) {
      onConfirm({
        mode,
        targetAccount: mode === "other" ? targetAccount : undefined,
        copies: numCopies,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-card-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Duplique {entityName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Escolha como você quer duplicar{" "}
            {level === "campanhas" ? "sua campanha" : "seu item"}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* OPÇÃO 1: MESMA CONTA */}
          <div
            onClick={() => setMode("same")}
            className={cn(
              "cursor-pointer border rounded-lg p-4 transition-all relative",
              mode === "same"
                ? "border-blue-500 bg-blue-500/10"
                : "border-border hover:border-muted-foreground/50",
            )}
          >
            <h3
              className={cn(
                "text-sm font-bold mb-1",
                mode === "same" ? "text-blue-500" : "text-foreground",
              )}
            >
              Mesma Conta de Anúncio
            </h3>
            <p className="text-xs text-muted-foreground">
              {level === "campanhas" ? "Sua campanha" : "Seu item"} será
              duplicado na mesma conta de anúncio a que pertence.
            </p>
          </div>

          {/* OPÇÃO 2: OUTRA CONTA */}
          <div
            onClick={() => canTransfer && setMode("other")}
            className={cn(
              "border rounded-lg p-4 transition-all relative",
              canTransfer ? "cursor-pointer" : "cursor-not-allowed opacity-60",
              mode === "other"
                ? "border-blue-500 bg-blue-500/10"
                : "border-border",
              !canTransfer && "bg-muted/20",
            )}
          >
            <h3
              className={cn(
                "text-sm font-bold mb-1",
                mode === "other" ? "text-blue-500" : "text-foreground",
              )}
            >
              Outra Conta de Anúncio
            </h3>
            <p className="text-xs text-muted-foreground">
              {level === "campanhas" ? "Sua campanha" : "Seu item"} será
              duplicado em outra conta de anúncio que você escolher.
            </p>

            {/* Aviso se não puder transferir (Igual ao print) */}
            {!canTransfer && (
              <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
                <Info size={12} />
                <span>
                  Apenas campanhas podem ser transferidas para outras contas de
                  anúncio.
                </span>
              </div>
            )}
          </div>

          {/* INPUTS CONDICIONAIS */}
          <div className="space-y-4 pt-2">
            {/* SELECT DE CONTA (Só aparece se mode == other) */}
            {mode === "other" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-xs font-medium">
                  Escolha a Conta de Anúncio
                </Label>
                <Select value={targetAccount} onValueChange={setTargetAccount}>
                  <SelectTrigger className="w-full bg-background border-border">
                    <SelectValue placeholder="Selecione a conta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ca01">
                      Conta 01 - Principal (Atual)
                    </SelectItem>
                    <SelectItem value="ca02">Conta 02 - Reserva</SelectItem>
                    <SelectItem value="ca03">Conta 03 - Scale Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* QUANTIDADE DE CÓPIAS (Sempre aparece) */}
            <div className="space-y-2">
              <Label htmlFor="copies" className="text-xs font-medium">
                Quantidade de cópias
              </Label>
              <Input
                id="copies"
                type="number"
                min={1}
                max={50}
                className="bg-background border-border"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
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
            // Desabilita se for "other" e não tiver conta selecionada, ou se copias for inválido
            disabled={
              (mode === "other" && !targetAccount) || parseInt(copies) < 1
            }
          >
            Duplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
