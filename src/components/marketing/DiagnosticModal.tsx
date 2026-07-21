"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, ChevronDown, Check, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DiagnosticModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adAccounts: { id: string; name: string }[];
  // 🔥 RECEBE A FUNÇÃO REAL QUE VAI CONVERSAR COM O SEU BACKEND
  onVerify: (
    selectedAccounts: string[],
    mode: "rapido" | "seguro",
  ) => Promise<void>;
};

export function DiagnosticModal({
  open,
  onOpenChange,
  adAccounts,
  onVerify,
}: DiagnosticModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"rapido" | "seguro">("rapido");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep(1);
        setMode("rapido");
        setSelectedAccounts([]);
        setIsVerifying(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleToggleAccount = (id: string) => {
    if (id === "all") {
      if (selectedAccounts.includes("all")) {
        setSelectedAccounts([]);
      } else {
        setSelectedAccounts(["all"]);
      }
      return;
    }

    let newSelection = selectedAccounts.filter((c) => c !== "all");
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter((c) => c !== id);
    } else {
      newSelection.push(id);
    }

    if (newSelection.length === adAccounts.length && adAccounts.length > 0) {
      newSelection = ["all"];
    }
    setSelectedAccounts(newSelection);
  };

  const handleVerify = async () => {
    if (selectedAccounts.length === 0) {
      toast.warning("Selecione pelo menos uma conta de anúncio.");
      return;
    }

    setIsVerifying(true);
    try {
      // Se "Selecionar todas" estiver ativo, mapeia para os IDs de todas as contas reais
      const accountsToVerify = selectedAccounts.includes("all")
        ? adAccounts.map((acc) => acc.id)
        : selectedAccounts;

      // 🔥 EXECUTA A SUA AÇÃO REAL DE INTEGRAÇÃO
      await onVerify(accountsToVerify, mode);

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao rodar diagnóstico. Tente novamente.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Diagnóstico
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 pt-1">
              {step === 1
                ? "Analise suas campanhas ativas e identifique quais anúncios não possuem a configuração correta de parâmetros UTM."
                : "Selecione as contas de anúncio que quer verificar a configuração:"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="flex flex-col gap-3">
              <div
                onClick={() => setMode("rapido")}
                className={cn(
                  "p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all duration-200",
                  mode === "rapido"
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-border bg-muted/30 hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg mt-0.5",
                    mode === "rapido" ? "bg-blue-500/20" : "bg-muted",
                  )}
                >
                  <Zap
                    className={cn(
                      "w-5 h-5",
                      mode === "rapido"
                        ? "text-blue-500 fill-blue-500/20"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      mode === "rapido" ? "text-blue-500" : "text-foreground",
                    )}
                  >
                    Rápido
                  </span>
                  <span className="text-[13px] text-muted-foreground/80 leading-relaxed">
                    Análise em segundos. Verifica a estrutura básica das URLs.
                  </span>
                </div>
              </div>

              <div
                onClick={() => setMode("seguro")}
                className={cn(
                  "p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all duration-200",
                  mode === "seguro"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-border bg-muted/30 hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg mt-0.5",
                    mode === "seguro" ? "bg-emerald-500/20" : "bg-muted",
                  )}
                >
                  <ShieldCheck
                    className={cn(
                      "w-5 h-5",
                      mode === "seguro"
                        ? "text-emerald-500"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      mode === "seguro"
                        ? "text-emerald-500"
                        : "text-foreground",
                    )}
                  >
                    Seguro
                  </span>
                  <span className="text-[13px] text-muted-foreground/80 leading-relaxed">
                    Não afeta a veiculação das campanhas. Apenas leitura.
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-1.5 mt-2 min-h-[140px]">
              <label className="text-xs font-medium text-muted-foreground">
                Conta de Anúncio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-border bg-background hover:bg-muted/50 text-foreground font-normal h-10 px-3"
                  >
                    <span className="truncate text-sm">
                      {selectedAccounts.length === 0
                        ? "Nenhum"
                        : selectedAccounts.includes("all")
                          ? "Todas selecionadas"
                          : `${selectedAccounts.length} selecionada(s)`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[440px] p-2 border-border bg-[#111317] shadow-xl rounded-xl"
                  align="start"
                >
                  <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto">
                    <div
                      onClick={() => handleToggleAccount("all")}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors"
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all",
                          selectedAccounts.includes("all")
                            ? "bg-blue-600 border-blue-600"
                            : "border-zinc-600 bg-zinc-900",
                        )}
                      >
                        {selectedAccounts.includes("all") && (
                          <Check
                            size={12}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">
                        Selecionar todas
                      </span>
                    </div>

                    {adAccounts.length > 0 && (
                      <div className="h-px bg-zinc-800 my-1 w-full" />
                    )}

                    {adAccounts.map((acc) => {
                      const isSelected =
                        selectedAccounts.includes("all") ||
                        selectedAccounts.includes(acc.id);
                      return (
                        <div
                          key={acc.id}
                          onClick={() => handleToggleAccount(acc.id)}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800/80 cursor-pointer transition-colors"
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-all",
                              isSelected
                                ? "bg-blue-600 border-blue-600"
                                : "border-zinc-600 bg-zinc-900",
                            )}
                          >
                            {isSelected && (
                              <Check
                                size={12}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                          <span className="text-sm font-medium text-zinc-300 truncate">
                            {acc.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="bg-muted/30 px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          {step === 2 && (
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={isVerifying}
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={() => (step === 1 ? setStep(2) : handleVerify())}
            disabled={isVerifying}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : step === 1 ? (
              "Iniciar"
            ) : (
              "Verificar Agora"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
