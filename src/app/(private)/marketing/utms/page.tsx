"use client";

import React, { useState, useMemo, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Download,
  Facebook,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { ReportingTable } from "@/components/data-table/ReportingTable";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { ColumnCustomizer } from "@/components/marketing/ColumnCustomizer";

// 🔥 Adicionamos o PremiumCard para manter o visual padronizado
import { PremiumCard } from "@/components/cards/PremiumCard";

import { getColumns } from "./columns";
import { UtmRow } from "./types";

// --- Ícones ---
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// --- DADOS MOCKADOS ROBUSTOS ---
const generateUtmData = (count: number): UtmRow[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `utm-${i}`,
    utm_source: Math.random() > 0.5 ? "facebook" : "google",
    utm_medium: "cpc",
    utm_campaign: `[Search] Campanha Institucional - ${i + 1}`,
    utm_content: `content_${i}`,
    utm_term: `term_${i}`,
    created_at: subDays(new Date(), Math.floor(Math.random() * 30)),
    product_name: Math.random() > 0.5 ? "produto_a" : "produto_b",
    account_name: Math.random() > 0.5 ? "conta_1" : "conta_2",

    // Financeiro
    budget: 100 + i,
    spent: Math.random() * 1000,
    revenue: Math.random() * 5000,
    profit: Math.random() * 2000,
    gross_revenue: Math.random() * 5500,
    pending_revenue: Math.random() * 500,
    refund_revenue: Math.random() * 50,
    product_costs: Math.random() * 200,
    taxes: Math.random() * 50,

    // Indicadores
    roas: 2 + Math.random(),
    margin: 30 + Math.random() * 10,
    roi: 1.5 + Math.random(),
    arpu: 15 + Math.random(),

    // Custos
    cpa: Math.random() * 50,
    cpc: Math.random() * 2,
    cpm: 15 + Math.random(),
    cpp: 10,
    cpt: 12,
    cpl: 5,
    cpi: 8,
    cpv: 0.5,
    cps: 1.2,
    cost_per_convo: 3.5,

    // Vendas/Conversão
    sales: Math.floor(Math.random() * 100),
    sales_pending: 2,
    sales_total: 102,
    sales_refunded: 1,
    ic: 50,
    icr: 25,
    atc: 80,
    conversations: 10,
    leads: 5,
    conversion_rate: 2.5,

    // Tráfego
    clicks: Math.floor(Math.random() * 500),
    ctr: 1.5,
    impressions: 10000,
    frequency: 1.2,
    page_views: 600,
    con_rate: 60,

    // Vídeo
    video_retention: 30,
    hook_rate: 45,
    hold_rate: 10,
    followers: 100,

    // Outros
    ad_account: "Conta Principal",
    creation_date: "2024-03-01",
    delivery_status: "Ativo",
  })) as any;
};

// COLUNAS PADRÃO
const DEFAULT_COLUMNS = [
  "sales",
  "cpa",
  "spent",
  "revenue",
  "profit",
  "roas",
  "margin",
  "roi",
  "clicks",
  "cpc",
];

export default function UtmsReportPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [data, setData] = useState<UtmRow[]>([]);

  const [groupBy, setGroupBy] = useState("utm_campaign");
  const [platforms, setPlatforms] = useState<string[]>(["meta", "google"]);

  // Estado das colunas (Carregado do LocalStorage)
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMNS);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("qualquer");
  const [selectedAccount, setSelectedAccount] = useState("qualquer");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    setData(generateUtmData(100));
  }, []);

  // Persistência com LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColumns = localStorage.getItem("utms_table_columns");
      if (savedColumns) {
        try {
          const parsed = JSON.parse(savedColumns);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setColumnOrder(parsed);
          }
        } catch (e) {
          console.error("Erro ao carregar colunas salvas", e);
        }
      }
    }
  }, []);

  const handleSaveColumns = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    if (typeof window !== "undefined") {
      localStorage.setItem("utms_table_columns", JSON.stringify(newOrder));
      toast.success("Colunas salvas com sucesso!");
    }
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowPlatform = row.utm_source === "facebook" ? "meta" : "google";
      if (!platforms.includes(rowPlatform)) return false;
      if (searchQuery) {
        const valueToSearch = String((row as any)[groupBy] || "").toLowerCase();
        if (!valueToSearch.includes(searchQuery.toLowerCase())) return false;
      }
      if (date?.from && date?.to && (row as any).created_at) {
        const rowDate = (row as any).created_at;
        if (
          !isWithinInterval(rowDate, {
            start: startOfDay(date.from),
            end: endOfDay(date.to),
          })
        )
          return false;
      }
      return true;
    });
  }, [data, platforms, searchQuery, date, groupBy]);

  const activeColumns = useMemo(() => {
    const allColumnDefs = getColumns(groupBy);
    const mainColumn = allColumnDefs[0];
    const metricColumns = allColumnDefs.slice(1).filter((col) => {
      return columnOrder.includes((col as any).accessorKey);
    });
    const sortedMetrics = metricColumns.sort((a, b) => {
      return (
        columnOrder.indexOf((a as any).accessorKey) -
        columnOrder.indexOf((b as any).accessorKey)
      );
    });
    return [mainColumn, ...sortedMetrics];
  }, [groupBy, columnOrder]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(generateUtmData(100));
      setIsRefreshing(false);
      toast.success("Atualizado!");
    }, 1000);
  };

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    toast.info("Gerando arquivo CSV...");

    // 1. Extrai cabeçalhos (chaves dos dados)
    const headers = Object.keys(filteredData[0]).join(",");

    // 2. Mapeia as linhas de dados
    const rows = filteredData.map((row) =>
      Object.values(row)
        .map((value) => {
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    );

    // 3. Monta o conteúdo final do CSV
    const csvContent = [headers, ...rows].join("\n");

    // 4. Cria o Blob e o Link de Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `relatorio_utms_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);

    // 5. Clica no link e limpa
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Download iniciado!");
  };

  const currentUser = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    image: "",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      {isHeaderVisible && (
        <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30">
          <MarketingHeader
            user={currentUser}
            hideControls={true}
            currentRevenue={0}
          />
        </div>
      )}

      <div className="flex-1 p-6 min-h-0 w-full flex flex-col transition-all duration-300">
        {/* 🔥 FIX APLICADO: PremiumCard com overflow-visible para soltar a rolagem */}
        <PremiumCard
          className="w-full flex-1 p-0 flex flex-col overflow-hidden relative z-0"
          contentClassName="overflow-visible flex flex-col h-full"
        >
          <div className="shrink-0 border-b border-border/60 w-full p-4 flex flex-wrap items-center justify-between gap-4 bg-card/50 relative z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-foreground mr-2">
                Relatório de UTMs
              </h2>
              <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-border/50 h-9">
                <ColumnCustomizer
                  currentColumns={columnOrder}
                  onSave={handleSaveColumns}
                />
                <div className="w-px h-4 bg-border/60 mx-1" />
                <button
                  onClick={() => togglePlatform("meta")}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    platforms.includes("meta")
                      ? "bg-blue-500/10 text-blue-500"
                      : "text-muted-foreground opacity-50 grayscale",
                  )}
                >
                  <Facebook
                    size={16}
                    fill="currentColor"
                    className="stroke-none"
                  />
                </button>
                <button
                  onClick={() => togglePlatform("google")}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    platforms.includes("google")
                      ? "bg-background shadow-sm text-foreground"
                      : "opacity-50 grayscale text-muted-foreground",
                  )}
                >
                  <GoogleIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border/60 mx-1" />
                <button
                  onClick={() => setIsHeaderVisible(!isHeaderVisible)}
                  className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {isHeaderVisible ? (
                    <ArrowUpFromLine size={16} />
                  ) : (
                    <ArrowDownToLine size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-transparent hover:bg-muted"
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
                />{" "}
                {isRefreshing ? "..." : "Atualizar"}
              </Button>
            </div>
          </div>

          <div className="shrink-0 p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 border-b border-border/60 bg-transparent relative z-10">
            {/* 1. Agrupar Por */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Agrupar por
              </label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utm_campaign">
                    Campanha (utm_campaign)
                  </SelectItem>
                  <SelectItem value="utm_medium">Meio (utm_medium)</SelectItem>
                  <SelectItem value="utm_source">
                    Origem (utm_source)
                  </SelectItem>
                  <SelectItem value="utm_content">
                    Conteúdo (utm_content)
                  </SelectItem>
                  <SelectItem value="utm_term">Termo (utm_term)</SelectItem>
                  <SelectItem value="src">SRC (src)</SelectItem>
                  <SelectItem value="keyword">
                    Palavra-chave (keyword)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Produto */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Produto
              </label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualquer">Qualquer</SelectItem>
                  <SelectItem value="produto_a">Produto A</SelectItem>
                  <SelectItem value="produto_b">Produto B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Conta */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Conta
              </label>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger className="h-9 w-full bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qualquer">Qualquer</SelectItem>
                  <SelectItem value="conta_1">Conta 01</SelectItem>
                  <SelectItem value="conta_2">Conta 02</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Período */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Período
              </label>
              <DatePickerWithRange
                date={date}
                setDate={setDate}
                className="w-full h-9 bg-background"
              />
            </div>

            {/* 5. Pesquisar */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Pesquisar
              </label>
              <div className="flex gap-2 relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Filtrar por nome..."
                  className="h-9 pl-9 w-full bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-background border-border"
                >
                  <Filter size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* 🔥 FIX APLICADO: Div encapsuladora responsável exclusivamente pelo Scroll */}
          <div className="flex-1 w-full relative bg-background rounded-b-xl overflow-hidden flex flex-col z-0">
            <ReportingTable
              columns={activeColumns as any}
              data={filteredData}
              pageSize={100}
              enableResizing={true}
              hidePagination={true}
              classNames={{
                // 🔥 O container cresce livremente
                container: "rounded-none border-0 shadow-none h-full flex-1",
                // A linha do Header permanece travada no topo
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
