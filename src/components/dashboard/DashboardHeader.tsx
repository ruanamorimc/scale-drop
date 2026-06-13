"use client";

import { useState, useEffect } from "react";
import { Download, Filter, RefreshCcw, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, differenceInMinutes } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

const HEADER_INPUT_STYLE = cn(
  "h-10 text-sm transition-all backdrop-blur-md shadow-sm font-normal",
  "bg-white/60 hover:bg-white/80 border-border/50 text-muted-foreground hover:text-foreground",
  "dark:bg-zinc-950/40 dark:hover:bg-zinc-900/60 dark:border-white/10 dark:text-muted-foreground dark:hover:text-foreground",
);

// Tipagem correta recebendo os produtos reais do banco (Zero 'any')
interface DashboardHeaderProps {
  data: Record<string, unknown>;
  products?: { id: string; name: string }[];
}

// Tipagem botão de export
interface TimelineDay {
    name: string;
    revenue?: number;
    profit?: number;
    productcost?: number;
    tax?: number;
  }

  interface FinanceExportData {
    totalPaid?: number;
    netProfit?: number;
    totalCostOfGoods?: number;
    totalTaxAmount?: number;
    adSpend?: number;
    countPaid?: number;
    ticketAverage?: number;
    timelineData?: TimelineDay[];
  }

export function DashboardHeader({ data, products = [] }: DashboardHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const {
    isValuesVisible,
    toggleVisibility,
    lastUpdated,
    refreshData,
    setSelectedProduct,
    selectedProduct,
  } = useDashboard();

  // Lê a data inicial da URL (ou usa "Hoje")
  const initialFrom = searchParams.get("from")
    ? new Date(searchParams.get("from")!.replace(/-/g, "/"))
    : new Date();
  const initialTo = searchParams.get("to")
    ? new Date(searchParams.get("to")!.replace(/-/g, "/"))
    : new Date();

  const [date, setDate] = useState<DateRange | undefined>({
    from: initialFrom,
    to: initialTo,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const minutesAgo = differenceInMinutes(currentTime, lastUpdated);
  const [openProductFilter, setOpenProductFilter] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. Sincroniza o Contexto Global caso haja um Produto na URL ao recarregar a página
  useEffect(() => {
    const urlProduct = searchParams.get("product");
    if (urlProduct && urlProduct !== selectedProduct) {
      setSelectedProduct(urlProduct);
    }
  }, [searchParams, selectedProduct, setSelectedProduct]);

  // 2. O GRANDE TRUQUE: Vigia Data E Produto ao mesmo tempo para atualizar a URL
  useEffect(() => {
    const currentFrom = searchParams.get("from") || "";
    const currentTo = searchParams.get("to") || "";
    const currentProduct = searchParams.get("product") || "";

    const newFrom = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const newTo = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const newProduct = selectedProduct || "";

    // Só reescreve a URL se algo realmente mudou, evitando loops infinitos
    if (
      newFrom !== currentFrom ||
      newTo !== currentTo ||
      newProduct !== currentProduct
    ) {
      const params = new URLSearchParams(searchParams.toString());

      if (newFrom) params.set("from", newFrom);
      else params.delete("from");

      if (newTo) params.set("to", newTo);
      else params.delete("to");

      if (newProduct) params.set("product", newProduct);
      else params.delete("product");

      // Push com scroll: false evita que a página pule para o topo ao filtrar!
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [date, selectedProduct, pathname, router, searchParams]);

  const statusColor = minutesAgo > 5 ? "bg-orange-500" : "bg-emerald-500";

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

  const handleExport = () => {
    if (!data) return toast.error("Sem dados para exportar.");

    try {
      // Casting seguro: Forçamos a leitura através da nossa Interface limpa
      const d = data as FinanceExportData;

      // 1. Montar as Linhas do CSV
      const rows: string[][] = [
        ["Resumo Financeiro", "Valor"],
        ["Faturamento Total", `R$ ${(d.totalPaid || 0).toFixed(2).replace(".", ",")}`],
        ["Lucro Líquido", `R$ ${(d.netProfit || 0).toFixed(2).replace(".", ",")}`],
        ["Custo dos Produtos", `R$ ${(d.totalCostOfGoods || 0).toFixed(2).replace(".", ",")}`],
        ["Taxas e Impostos", `R$ ${(d.totalTaxAmount || 0).toFixed(2).replace(".", ",")}`],
        ["Marketing (Ads)", `R$ ${(d.adSpend || 0).toFixed(2).replace(".", ",")}`],
        ["Total de Pedidos Pagos", String(d.countPaid || 0)],
        ["Ticket Médio", `R$ ${(d.ticketAverage || 0).toFixed(2).replace(".", ",")}`],
        [], // Linha em branco
        ["Detalhamento por Data", "Receita", "Lucro", "Custo do Produto", "Taxas e Impostos"]
      ];

      // 2. Injetar os dados do Gráfico Dinâmico
      if (Array.isArray(d.timelineData)) {
        // O TypeScript agora infere automaticamente que 'day' é do tipo TimelineDay
        d.timelineData.forEach((day) => {
          rows.push([
            day.name || "Data Desconhecida",
            `R$ ${(day.revenue || 0).toFixed(2).replace(".", ",")}`,
            `R$ ${(day.profit || 0).toFixed(2).replace(".", ",")}`,
            `R$ ${(day.productcost || 0).toFixed(2).replace(".", ",")}`,
            `R$ ${(day.tax || 0).toFixed(2).replace(".", ",")}`,
          ]);
        });
      }

      // 3. Montar e baixar o arquivo (Com suporte a acentos no Excel)
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(";")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const fileName = `relatorio_dashboard_${format(new Date(), "dd-MM-yyyy")}.csv`;
      link.setAttribute("download", fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar o arquivo CSV.");
    }
  };

  // Encontra o nome bonito do produto para mostrar no botão
  const selectedProductName = products.find(
    (p) => p.id === selectedProduct,
  )?.name;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 lg:pl-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground tabular-nums mr-1">
              <span
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  statusColor,
                )}
              />
              <span className="whitespace-nowrap">
                Atualizado há {minutesAgo} min
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={cn(HEADER_INPUT_STYLE, "w-9 px-0")}
              disabled={isRefreshing}
            >
              <RefreshCcw
                size={16}
                className={cn(isRefreshing && "animate-spin")}
              />
            </Button>
          </div>

          <div className="shrink-0">
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className={HEADER_INPUT_STYLE}
            />
          </div>

          <Popover open={openProductFilter} onOpenChange={setOpenProductFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProductFilter}
                className={cn(HEADER_INPUT_STYLE, "w-[180px] justify-between")}
              >
                <span className="truncate">
                  {selectedProduct && selectedProductName
                    ? selectedProductName
                    : "Filtrar produto"}
                </span>
                <Filter className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border border-border/50 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl text-foreground shadow-lg">
              <Command className="bg-transparent">
                <CommandInput
                  placeholder="Buscar..."
                  className="h-9 border-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
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
                      className="cursor-pointer text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      Todos os produtos
                    </CommandItem>

                    {/* Renderiza a lista REAL de produtos */}
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={() => {
                          setSelectedProduct(
                            product.id === selectedProduct ? null : product.id,
                          );
                          setOpenProductFilter(false);
                        }}
                        className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                      >
                        <span className="truncate">{product.name}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            selectedProduct === product.id
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

          <Button
            variant="outline"
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
