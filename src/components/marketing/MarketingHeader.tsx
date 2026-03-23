"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  EyeOff,
  Pencil,
  Trophy,
  Info,
  Monitor,
  RotateCcw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Progress importado mas optamos pela div customizada para manter o gradiente
import { Progress } from "@/components/ui/progress" 

interface UserData {
  name: string;
  email: string;
  image?: string | null;
}

interface MarketingHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  showValues: boolean;
  setShowValues: (value: boolean) => void;
  user: UserData;
  onSave: () => void;
  onReset: () => void;
  hideControls?: boolean;
  currentRevenue?: number;
}

export function MarketingHeader({
  isEditing,
  setIsEditing,
  showValues,
  setShowValues,
  user,
  onSave,
  onReset,
  hideControls,
  currentRevenue = 0
}: MarketingHeaderProps) {

  // 1. Lógica de Metas (Dinâmica)
  const getNextMilestone = (revenue: number) => {
    if (revenue < 10000) return 10000;       // Meta 10k
    if (revenue < 100000) return 100000;     // Meta 100k
    if (revenue < 500000) return 500000;     // Meta 500k
    if (revenue < 1000000) return 1000000;   // Meta 1M
    return 5000000;                          // Meta 5M
  };

  const nextGoal = getNextMilestone(currentRevenue);
  
  // 2. Cálculo da Porcentagem (Limitada a 100%)
  const progressPercentage = Math.min((currentRevenue / nextGoal) * 100, 100);

  // 3. Formatador de Moeda Curto (ex: 15 mil)
  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)} mil`;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";

  // --- MODO DE EDIÇÃO ---
  if (isEditing) {
    return (
      <div className="flex items-center justify-between w-full p-3 rounded-xl border border-blue-900/50 bg-slate-900/95 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Pencil size={16} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">
              Você está editando esse dashboard para:
            </span>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-bold uppercase tracking-wider">
              <Monitor size={12} /> Desktop
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
          >
            <RotateCcw size={14} /> Redefinir configurações
          </Button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Cancelar
          </Button>

          <Button
            size="sm"
            onClick={onSave}
            className="text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 font-semibold px-6"
          >
            Salvar
          </Button>
        </div>
      </div>
    );
  }

  // --- MODO PADRÃO ---
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          Dashboard - Principal
        </h1>
        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
        
        {!hideControls && (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowValues(!showValues)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showValues ? "Ocultar valores" : "Mostrar valores"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personalizar tela</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-6 w-full md:w-auto">
        <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy size={16} className="text-yellow-500" />
            <span className="font-medium text-foreground">Prêmios</span>
            
            {/* 🔥 TOOLTIP RICO (Imagem 2) */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Info
                    size={12}
                    className="cursor-help opacity-50 hover:opacity-100 transition-opacity"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-[#0f1115] border-zinc-800 text-white p-3 max-w-[280px]">
                    <div className="space-y-2">
                      <p className="font-semibold text-xs">Progresso para receber prêmios.</p>
                      <p className="text-[11px] text-zinc-400">
                        Baseado no faturamento trackeado com a Utmify.
                      </p>
                      <div className="flex flex-col gap-0.5 pt-1">
                        <span className="text-[10px] text-zinc-500 font-medium">(atualizado semanalmente)</span>
                        <span className="text-[10px] text-zinc-500 font-medium">[apenas para assinantes]</span>
                      </div>
                    </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* 🔥 TEXTO DA META DINÂMICO */}
            <span className="ml-1 font-mono text-[11px] opacity-80">
              {formatShortCurrency(currentRevenue)} <span className="text-muted-foreground/50">/</span> {formatShortCurrency(nextGoal)}
            </span>
          </div>

          {/* 🔥 BARRA DE PROGRESSO FUNCIONAL */}
          <div className="w-full sm:w-64 h-2 bg-muted rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block" />
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground leading-none">
              {user.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium mt-1 bg-muted px-1.5 py-0.5 rounded-sm">
              Usuário
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user.image || ""} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}