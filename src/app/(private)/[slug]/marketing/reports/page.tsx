"use client";

import React, { useState, useMemo, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  startOfWeek,
  addDays,
  format,
  subWeeks,
  startOfDay,
  addHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// COMPONENTS
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { ReportingTable } from "@/components/data-table/ReportingTable";
import { ColumnCustomizer } from "@/components/marketing/ColumnCustomizer"; // 🔥 Usando o seu componente de Customização

// IMPORTA AS COLUNAS DA TABELA
import { getColumns } from "./columns";

// IMPORTA AS MÉTRICAS DO SEU ARQUIVO CENTRAL
import { AVAILABLE_METRICS } from "@/constants/meta-metrics";

const PRODUCTS = [
  "Financeiro Produtivo",
  "Atualizações e Novos Recursos",
  "Empresa Produtiva",
  "Plano Família",
  "Clara - Assistente Financeira",
];

// 🔥 DEFINE AS COLUNAS PADRÕES BASEADAS NA SUA IMAGEM
// Os IDs precisam bater exatamente com o campo "id" do meta-metrics.ts
const DEFAULT_COLUMNS = [
  "sales",       // Vendas
  "cpa",         // CPA
  "spent",       // Gastos
  "taxes",       // Despesas
  "revenue",     // Faturamento
  "profit",      // Lucro
  "roas",        // ROAS
  "margin",      // Margem
  "roi",         // ROI
  "ic",          // IC
  "cpi",         // CPI
  "cpc",         // CPC
  "ctr",         // CTR
  "cpm",         // CPM
  "impressions", // Impressões
  "clicks",      // Cliques
];

export default function ReportsPage() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [data, setData] = useState<any[]>([]);

  // Filtros
  const [groupBy, setGroupBy] = useState("dia");
  const [period, setPeriod] = useState("essa_semana");
  const [account, setAccount] = useState("todas");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Estado das colunas escolhidas pela Engrenagem
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMNS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session } = authClient.useSession();

  // 🔥 1. PERSISTÊNCIA DAS COLUNAS SELECIONADAS (Carrega ao abrir a página)
  useEffect(() => {
    // Tenta carregar do LocalStorage (Para carregar a tela rapidamente)
    if (typeof window !== "undefined") {
      const savedColumns = localStorage.getItem("relatorios_table_columns");
      if (savedColumns) {
        try {
          const parsed = JSON.parse(savedColumns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setColumnOrder(parsed);
          }
        } catch (e) {
          console.error("Erro ao carregar colunas", e);
        }
      }
    }

    // 🚀 Lógica futura para carregar do Banco de Dados (Descomente quando integrar a API)
    /*
    const fetchCloudPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        const dbData = await response.json();
        
        if (dbData && dbData.relatoriosColumns) {
           setColumnOrder(dbData.relatoriosColumns);
           localStorage.setItem("relatorios_table_columns", JSON.stringify(dbData.relatoriosColumns));
        }
      } catch (error) {
        console.error("Erro ao buscar preferências da nuvem", error);
      }
    };
    if (session?.user) { fetchCloudPreferences(); }
    */
  }, [session]);

  // 🔥 SALVA AS COLUNAS (Acionado quando o usuário clica no modal)
  const handleSaveColumns = async (newOrder: string[]) => {
    // 1. Atualiza a tela imediatamente
    setColumnOrder(newOrder);

    // 2. Salva no LocalStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("relatorios_table_columns", JSON.stringify(newOrder));
    }

    // 🚀 Lógica futura para salvar no Banco de Dados (Descomente quando integrar a API)
    /*
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatoriosColumns: newOrder })
      });
      // toast.success("Preferências sincronizadas na nuvem!");
    } catch (error) {
      console.error("Erro ao salvar colunas no banco", error);
    }
    */
  };

  // 2. GERAÇÃO DINÂMICA DE DADOS (Mock)
  useEffect(() => {
    let newData = [];

    // GERA DADOS FALSOS DINÂMICOS PARA QUALQUER MÉTRICA EXISTENTE NO SEU ARQUIVO
    const generateDynamicMetrics = () => {
      return AVAILABLE_METRICS.reduce((acc, metric) => {
        const id = metric.id.toLowerCase();
        // Tenta adivinhar o formato com base no nome do ID da métrica
        if (
          id.includes("spent") ||
          id.includes("cpa") ||
          id.includes("revenue") ||
          id.includes("profit") ||
          id.includes("taxes") ||
          id.includes("cost") ||
          id.includes("value")
        ) {
          acc[metric.id] = `R$ ${(Math.random() * 500).toFixed(2)}`;
        } else if (id.includes("roas") || id.includes("roi")) {
          acc[metric.id] = (Math.random() * 5 + 1).toFixed(2);
        } else if (
          id.includes("margin") ||
          id.includes("rate") ||
          id.includes("ctr")
        ) {
          acc[metric.id] = `${Math.floor(Math.random() * 50 + 20)}%`;
        } else {
          acc[metric.id] = Math.floor(Math.random() * 100); // Números inteiros para clicks, leads, etc
        }
        return acc;
      }, {} as any);
    };

    if (groupBy === "dia") {
      // 7 Dias da Semana Fixos (Sempre inicia na Segunda-feira)
      const baseDate =
        period === "semana_passada" ? subWeeks(new Date(), 1) : new Date();
      const start = startOfWeek(baseDate, { weekStartsOn: 1 });

      newData = Array.from({ length: 7 }).map((_, i) => {
        const currentDate = addDays(start, i);
        const diaDaSemana = format(currentDate, "EEEE", { locale: ptBR });
        const diaFormatado =
          diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1);

        return {
          id: `day-${i}`,
          data: format(currentDate, "dd/MM/yyyy"),
          dia: diaFormatado,
          ...generateDynamicMetrics(), // Injeta todas as métricas no mock
        };
      });
    } else {
      // 24 Horas do Dia Fixas
      const today = startOfDay(new Date());
      newData = Array.from({ length: 24 }).map((_, i) => {
        const currentHour = addHours(today, i);
        return {
          id: `hour-${i}`,
          data: format(today, "dd/MM/yyyy"),
          dia: format(currentHour, "HH:00"),
          ...generateDynamicMetrics(), // Injeta todas as métricas no mock
        };
      });
    }

    setData(newData);
  }, [groupBy, period]);

  // 3. Produtos (Multi-select)
  const isAllProductsSelected = selectedProducts.length === PRODUCTS.length;
  const handleToggleProduct = (product: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, product] : prev.filter((p) => p !== product),
    );
  };
  const handleToggleAllProducts = (checked: boolean) => {
    setSelectedProducts(checked ? [...PRODUCTS] : []);
  };

  const filteredData = useMemo(() => {
    return data;
  }, [data, selectedProducts, account]);

  // 🔥 4. LÓGICA DE COLUNAS ATIVAS PARA A TABELA
  const activeColumns = useMemo(() => {
    // Puxa as definições do columns.tsx (Que agora deve ser gerado dinamicamente!)
    const allColumnDefs = getColumns();
    const visibleCols = [];

    // Garantimos que DATA e DIA sempre estarão no começo da tabela (Fixas)
    const fixedStartCols = ["data", "dia"];

    // A ordem final é a união dos fixos com as colunas habilitadas na engrenagem (columnOrder)
    const finalOrder = [
      ...fixedStartCols,
      ...columnOrder.filter((id) => !fixedStartCols.includes(id)),
    ];

    // Mapeia os IDs da ordem final para as definições de colunas reais
    finalOrder.forEach((colId) => {
      const colDef = allColumnDefs.find(
        (def) => (def as any).accessorKey === colId || def.id === colId,
      );
      if (colDef) visibleCols.push(colDef);
    });

    return visibleCols;
  }, [columnOrder]); // Atualiza sempre que columnOrder muda

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData([...data]);
      setIsRefreshing(false);
      toast.success("Relatórios atualizados!");
    }, 1000);
  };

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }
    toast.info("Gerando arquivo...");

    const headers = activeColumns
      .map((c: any) => {
        // Tenta extrair a string do Header
        return c.accessorKey;
      })
      .join(",");

    const rows = filteredData.map((row) =>
      activeColumns
        .map((col: any) => {
          let value = row[col.accessorKey];
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && value.includes(","))
            return `"${value}"`;
          return value;
        })
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `Relatório-ScaleDrop.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Download concluído!");
  };

  const currentUser = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    image: "",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      {isHeaderVisible && (
        <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30 animate-in slide-in-from-top-2 duration-200">
          <MarketingHeader user={currentUser} hideControls={true} />
        </div>
      )}

      <div className="flex-1 p-6 min-h-0 w-full flex flex-col transition-all duration-300">
        <PremiumCard
          className="w-full flex-1 p-0 flex flex-col overflow-hidden relative z-0"
          contentClassName="overflow-visible flex flex-col h-full"
        >
          {/* TOOLBAR SUPERIOR */}
          <div className="flex flex-wrap items-center justify-between p-4 border-b border-border/60 bg-transparent gap-4 relative z-10 shrink-0">
            <div className="flex items-center gap-3 relative z-10">
              <h2 className="text-sm font-semibold text-foreground mr-2">
                Relatórios
              </h2>

              <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-border/50 h-9">
                
                {/* 🔥 SEU MODAL COLUMNCUSTOMIZER (Que agora atualiza o columnOrder) */}
                <ColumnCustomizer
                  currentColumns={columnOrder}
                  onSave={handleSaveColumns}
                />

                <div className="w-px h-4 bg-border/60 mx-1" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsHeaderVisible(!isHeaderVisible)}
                        className="h-7 w-7 flex items-center justify-center rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        {isHeaderVisible ? (
                          <ArrowUpFromLine size={14} />
                        ) : (
                          <ArrowDownToLine size={14} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="text-xs bg-black text-white border-zinc-800"
                    >
                      <p>
                        {isHeaderVisible
                          ? "Esconder cabeçalho"
                          : "Mostrar cabeçalho"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={handleExport}
              >
                <Download size={14} /> Exportar
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  size={14}
                  className={cn(isRefreshing && "animate-spin")}
                />
                {isRefreshing ? "..." : "Atualizar"}
              </Button>
            </div>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="shrink-0 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-border/60 bg-transparent relative z-10">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Agrupar por
              </label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Por dia</SelectItem>
                  <SelectItem value="hora">Por hora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Período de Visualização
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essa_semana">Essa semana</SelectItem>
                  <SelectItem value="semana_passada">Semana passada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Conta de Anúncio
              </label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="ca_01">CA 01</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Produto
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 justify-between font-normal bg-background border-border px-3 text-sm hover:bg-background"
                  >
                    <span className="truncate">
                      {selectedProducts.length === 0
                        ? "Qualquer"
                        : selectedProducts.length === PRODUCTS.length
                          ? "Todos selecionados"
                          : `${selectedProducts.length} selecionado(s)`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-popover border-border">
                  <DropdownMenuCheckboxItem
                    checked={isAllProductsSelected}
                    onCheckedChange={handleToggleAllProducts}
                    className="font-semibold"
                  >
                    Selecionar todos
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {PRODUCTS.map((prod) => (
                    <DropdownMenuCheckboxItem
                      key={prod}
                      checked={selectedProducts.includes(prod)}
                      onCheckedChange={(checked) =>
                        handleToggleProduct(prod, checked)
                      }
                    >
                      {prod}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* TABELA DE DADOS */}
          <div className="flex-1 w-full relative bg-background rounded-b-xl overflow-hidden flex flex-col z-0">
            <ReportingTable
              columns={activeColumns as any}
              data={filteredData}
              pageSize={40}
              hidePagination={true}
              enableResizing={true}
              classNames={{
                container: "rounded-none border-0 shadow-none h-full flex-1",
                headerRow:
                  "bg-card sticky top-0 z-20 text-[10px] text-muted-foreground/80 uppercase shadow-sm",
              }}
            />
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}