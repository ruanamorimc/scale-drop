"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info, Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { PremiumCard } from "../cards/PremiumCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateRange } from "react-day-picker";

// 1. Criamos os moldes exatos do que vem do banco de dados
export type FilterOptionItem = {
  id: string;
  name: string | null;
};

export type AdAccountItem = {
  accountId: string;
  name: string | null;
};

// 🔥 Tipagem 100% rigorosa (Adeus "any")
type MarketingFiltersProps = {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  conta: string[]; // É array por causa do multi-select
  setConta: (value: string[]) => void;
  fonte: string;
  setFonte: (value: string) => void;
  plataforma: string;
  setPlataforma: (value: string) => void;
  produto: string;
  setProduto: (value: string) => void;
  onUpdate: () => void | Promise<void>;
  lastUpdated: Date;
  filterOptions: {
    adAccounts: AdAccountItem[];
    sources: FilterOptionItem[];
    products: FilterOptionItem[];
    platforms: FilterOptionItem[];
  };
};

// Tipagem do componente de item
type FilterItemProps = {
  label: string;
  children: React.ReactNode;
  tooltip?: string;
  className?: string;
};

function FilterItem({ label, children, tooltip, className }: FilterItemProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className || "")}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Info
                  size={12}
                  className="cursor-help text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[280px] text-xs bg-slate-900 border-slate-800 text-slate-200"
              >
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {children}
    </div>
  );
}

export function MarketingFilters({
  date,
  setDate,
  conta,
  setConta,
  fonte,
  setFonte,
  plataforma,
  setPlataforma,
  produto,
  setProduto,
  onUpdate,
  lastUpdated,
  filterOptions,
}: MarketingFiltersProps) {
  // Novo estado de Loading
  const [isUpdating, setIsUpdating] = useState(false);

  // Função que intercepta o clique, liga o loading, e desliga quando acabar
  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await onUpdate();
    } finally {
      setIsUpdating(false);
    }
  };
  // Lógica de seleção múltipla das Contas
  const handleToggleConta = (id: string) => {
    if (id === "all") {
      setConta(["all"]);
      return;
    }

    let novasContas = conta.filter((c) => c !== "all"); // Tira o "all" se clicar em uma específica
    if (novasContas.includes(id)) {
      novasContas = novasContas.filter((c) => c !== id); // Desmarca se já estiver
    } else {
      novasContas.push(id); // Marca se não estiver
    }

    if (novasContas.length === 0) novasContas = ["all"]; // Se desmarcar tudo, volta pro "all"
    setConta(novasContas);
  };

  const [timeText, setTimeText] = useState("agora mesmo");
  const [dotColor, setDotColor] = useState(
    "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
  );

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const diffInMinutes = Math.floor((now - lastUpdated.getTime()) / 60000);

      if (diffInMinutes < 1) {
        setTimeText("agora mesmo");
        setDotColor("bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]");
      } else if (diffInMinutes < 60) {
        setTimeText(`há ${diffInMinutes} min`);
        setDotColor(
          diffInMinutes >= 5
            ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
        );
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        setTimeText(`há ${hours} hora${hours > 1 ? "s" : ""}`);
        setDotColor("bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <PremiumCard className="w-full shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border gap-4 bg-muted/20">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resumo</h3>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-colors duration-500",
                dotColor,
              )}
            />
            Atualizado {timeText}
          </div>

          <Button
            size="sm"
            onClick={handleUpdateClick}
            disabled={isUpdating} // Desabilita o botão enquanto carrega
            className="group/btn relative overflow-hidden px-5 w-40 py-4 rounded-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 flex items-center justify-center disabled:opacity-80 disabled:pointer-events-none disabled:scale-100 cursor-pointer"
          >
            {/* 🔥 O Feixe de Luz Perfeito (só anima na ida) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-0 group-hover/btn:duration-[1200ms] ease-out" />

            {/* 🔥 Lógica Condicional do Texto e Ícone */}
            {isUpdating ? (
              <span className="flex items-center gap-2 text-white font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                Atualizando...
              </span>
            ) : (
              <span className="text-white font-medium relative z-10">
                Atualizar
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
        <FilterItem
          label="Período de Visualização"
          tooltip="Este é o período de visualização dos dados. Por exemplo, se você escolher 'Hoje', vamos listar as campanhas que foram criadas ou tiveram gastos hoje."
          className="sm:col-span-2 xl:col-span-1"
        >
          <div className="w-full">
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className="w-full"
            />
          </div>
        </FilterItem>

        {/* 🔥 CONTA DE ANÚNCIO (POPOVER DINÂMICO UTMIFY) */}
        <FilterItem label="Conta de Anúncio">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 w-full justify-between border-border bg-background text-foreground hover:bg-background/80 font-normal px-3"
              >
                <span className="truncate">
                  {conta.includes("all")
                    ? "Qualquer"
                    : `${conta.length} selecionada(s)`}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[240px] p-2 border-border bg-background shadow-xl rounded-xl">
              <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div
                  onClick={() => handleToggleConta("all")}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                      conta.includes("all")
                        ? "bg-blue-600 border-blue-600"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {conta.includes("all") && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Selecionar todas
                  </span>
                </div>

                {/* Se houver contas do Meta cadastradas, exibe a categoria e mapeia os dados reais */}
                {filterOptions.adAccounts.length > 0 && (
                  <>
                    <div className="h-px bg-border/50 my-1 w-full" />
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1 tracking-wider">
                      Meta Ads
                    </span>

                    {filterOptions.adAccounts.map((acc) => (
                      <div
                        key={acc.accountId}
                        onClick={() => handleToggleConta(acc.accountId)}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                            conta.includes(acc.accountId)
                              ? "bg-blue-600 border-blue-600"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {conta.includes(acc.accountId) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {acc.name || acc.accountId}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </FilterItem>

        {/* 🔥 FONTE DE TRÁFEGO DINÂMICA */}
        <FilterItem label="Fonte de Tráfego">
          <Select value={fonte} onValueChange={setFonte}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              {filterOptions.sources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>

        {/* 🔥 PLATAFORMA DINÂMICA */}
        <FilterItem label="Plataforma">
          <Select value={plataforma} onValueChange={setPlataforma}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              {filterOptions.platforms.map((plat) => (
                <SelectItem key={plat.id} value={plat.id}>
                  {plat.name} {/* Ou plat.platform dependendo do seu schema */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>

        {/* 🔥 PRODUTO DINÂMICO */}
        <FilterItem label="Produto">
          <Select value={produto} onValueChange={setProduto}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              {filterOptions.products.map((prod) => (
                <SelectItem key={prod.id} value={prod.id}>
                  {prod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>
      </div>
    </PremiumCard>
  );
}
