"use client";

import { useState, useEffect } from "react";
import { Download, Filter, RefreshCcw, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays, differenceInMinutes } from "date-fns";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { toast } from "sonner";

// --- ESTILO PREMIUM PADRÃO PARA INPUTS DO HEADER ---
// H-9 (altura menor), fundo translúcido escuro, borda sutil, blur, texto mais leve.
const HEADER_INPUT_STYLE = cn(
  "h-9 bg-zinc-950/40 hover:bg-zinc-900/60 border-white/10 text-muted-foreground hover:text-foreground text-sm transition-all backdrop-blur-md shadow-sm font-normal",
);

// Mock de Produtos
const mockProducts = [
  { value: "prod_001", label: "Bluetooth Headphones" },
  { value: "prod_002", label: "Smartwatch Series 7" },
  { value: "prod_003", label: "Mirrorless Camera" },
  { value: "prod_004", label: "Mechanical Keyboard" },
  { value: "prod_005", label: "Gaming Mouse" },
];

interface DashboardHeaderProps {
  data?: any;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  const router = useRouter();
  const {
    isValuesVisible,
    toggleVisibility,
    lastUpdated,
    refreshData,
    setSelectedProduct,
    selectedProduct,
  } = useDashboard();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const [openProductFilter, setOpenProductFilter] = useState(false);

  // --- Lógica de Tempo Real ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesAgo(differenceInMinutes(new Date(), lastUpdated));
    }, 60000);
    setMinutesAgo(differenceInMinutes(new Date(), lastUpdated)); // Atualiza imediatamente ao montar/refresh
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const statusColor = minutesAgo > 5 ? "bg-orange-500" : "bg-emerald-500";

  // --- Função de Refresh ---
  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    toast.promise(
      new Promise((resolve) => {
        router.refresh();
        refreshData();
        setTimeout(() => {
          setIsRefreshing(false);
          resolve(true);
        }, 1000);
      }),
      {
        loading: "Atualizando dashboard...",
        success: "Dados atualizados!",
        error: "Erro ao atualizar",
      },
    );
  };

  // --- Função Exportar CSV ---
  const handleExport = () => {
    if (!data) return toast.error("Sem dados para exportar.");
    // ... (Lógica de exportação CSV mantida igual) ...
    // (Vou omitir aqui para economizar espaço, mas mantenha o código anterior)
    toast.success("Relatório exportado!");
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Saudação + Olho */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVisibility}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {isValuesVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
          </h2>
          <p className="text-sm text-muted-foreground">
            Visão geral da performance da sua loja.
          </p>
        </div>

        {/* Controles da Direita */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 lg:pl-4">
          {/* Status + Botão Refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground tabular-nums mr-1">
              <span
                className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}
              />
              <span className="whitespace-nowrap">
                Atualizado há {minutesAgo} min
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              // APLICANDO O ESTILO PADRÃO
              className={cn(HEADER_INPUT_STYLE, "w-9 px-0")}
              disabled={isRefreshing}
            >
              <RefreshCcw
                size={16}
                className={cn(isRefreshing && "animate-spin")}
              />
            </Button>
          </div>

          {/* Separador visual sutil */}
          <div className="h-6 w-px bg-white/10 hidden md:block" />

          {/* Seletor de Data (Passando a classe de estilo) */}
          <div className="shrink-0">
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className={HEADER_INPUT_STYLE}
            />
          </div>

          {/* Filtro de Produto */}
          <Popover open={openProductFilter} onOpenChange={setOpenProductFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProductFilter}
                // APLICANDO O ESTILO PADRÃO + Largura específica
                className={cn(HEADER_INPUT_STYLE, "w-[180px] justify-between")}
              >
                <span className="truncate">
                  {selectedProduct
                    ? mockProducts.find((p) => p.value === selectedProduct)
                        ?.label
                    : "Filtrar produto"}
                </span>
                <Filter className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            {/* Conteúdo do Popover (Estilo Dark Clean) */}
            <PopoverContent className="w-[200px] p-0 border-white/10 bg-zinc-950/95 backdrop-blur-xl text-foreground">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Buscar..."
                  className="h-9 border-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50"
                />
                <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden">
                  <CommandEmpty className="py-2 text-sm text-muted-foreground text-center">
                    Nenhum resultado.
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setSelectedProduct(null);
                        setOpenProductFilter(false);
                      }}
                      className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-white/5"
                    >
                      Todos os produtos
                    </CommandItem>
                    {mockProducts.map((product) => (
                      <CommandItem
                        key={product.value}
                        value={product.label}
                        onSelect={() => {
                          setSelectedProduct(product.value);
                          setOpenProductFilter(false);
                        }}
                        className="cursor-pointer hover:bg-white/5 hover:text-foreground"
                      >
                        <span className="truncate">{product.label}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            selectedProduct === product.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Botão Exportar */}
          <Button
            variant="outline"
            // APLICANDO O ESTILO PADRÃO
            className={cn(HEADER_INPUT_STYLE, "gap-2")}
            onClick={handleExport}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
