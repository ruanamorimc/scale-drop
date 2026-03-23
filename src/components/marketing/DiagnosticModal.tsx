"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Activity,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagnosticModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Estados do Wizard
type Step = "intro" | "selection" | "analyzing" | "result";

export function DiagnosticModal({ open, onOpenChange }: DiagnosticModalProps) {
  const [step, setStep] = useState<Step>("intro");
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  // Função para resetar o modal ao fechar
  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setTimeout(() => setStep("intro"), 300); // Reseta após a animação de fechar
    }
  };

  // Simula a análise
  const startAnalysis = () => {
    setStep("analyzing");
    // Simula um tempo de processamento de 2 segundos
    setTimeout(() => {
      setStep("result");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 🔥 MUDANÇA AQUI: 
         1. Trocamos bg-[#1A1D21] por 'bg-card' (adapta ao tema)
         2. Mantemos text-card-foreground para o texto se adaptar
      */}
      <DialogContent className="sm:max-w-[600px] bg-card border-border text-card-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {step === "result" ? "Relatório de Diagnóstico" : "Diagnóstico"}
          </DialogTitle>
        </DialogHeader>

        {/* --- PASSO 1: INTRODUÇÃO --- */}
        {step === "intro" && (
          <div className="space-y-6 py-2">
            <p className="text-sm text-muted-foreground">
              Analise suas campanhas ativas e identifique quais anúncios não
              possuem a configuração correta de parâmetros UTM.
            </p>

            <div className="grid gap-4">
              {/* Cards internos usando bg-muted/30 para funcionar no claro e escuro */}
              <div className="flex items-start gap-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10">
                <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                    Rápido
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Análise em segundos. Verifica a estrutura básica das URLs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-emerald-600 dark:text-emerald-400">
                    Seguro
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Não afeta a veiculação das campanhas. Apenas leitura.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                onClick={() => setStep("selection")}
              >
                Iniciar
              </Button>
            </div>
          </div>
        )}

        {/* --- PASSO 2: SELEÇÃO DE CONTA --- */}
        {step === "selection" && (
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Selecione as contas de anúncio que quer verificar a
                configuração:
              </h3>
              <div className="text-xs text-muted-foreground mb-4">
                Conta de Anúncio
              </div>

              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Selecionar todas</SelectItem>
                  <SelectItem value="ca01">Conta 01 - Principal</SelectItem>
                  <SelectItem value="ca02">Conta 02 - Reserva</SelectItem>
                </SelectContent>
              </Select>

              {/* Checkbox adaptado */}
              <div className="mt-4 flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/30">
                <Checkbox id="terms" checked={true} disabled />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Verificar apenas campanhas ativas
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep("intro")}
                className="text-muted-foreground hover:text-foreground"
              >
                Voltar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={startAnalysis}
                disabled={!selectedAccount}
              >
                Verificar Agora
              </Button>
            </div>
          </div>
        )}

        {/* --- PASSO 3: ANALISANDO (LOADING) --- */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Analisando parâmetros UTM dos anúncios...
            </p>
          </div>
        )}

        {/* --- PASSO 4: RESULTADO (SUCESSO) --- */}
        {step === "result" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <CheckCircle2 className="h-20 w-20 text-emerald-500 relative z-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                Parabéns!
              </h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Todas as suas campanhas estão configuradas corretamente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
              <div className="bg-background border border-border rounded-lg p-3 flex flex-col items-center shadow-sm">
                <span className="text-2xl font-bold text-foreground">0</span>
                <span className="text-xs text-muted-foreground text-center">
                  com erro
                </span>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 flex flex-col items-center shadow-sm">
                <span className="text-2xl font-bold text-foreground">0</span>
                <span className="text-xs text-muted-foreground text-center">
                  atenção
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full max-w-sm border-border mt-4"
              onClick={() => handleOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
