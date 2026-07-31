"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  Download,
  Facebook,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronDown,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { ReportingTable } from "@/components/data-table/ReportingTable";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { ColumnCustomizer } from "@/components/marketing/ColumnCustomizer";
import { PremiumCard } from "@/components/cards/PremiumCard";

import { getColumns } from "./columns";
import { UtmRow } from "./types";

import { exportToCsv } from "@/lib/export-utils";
import { getUtmReport, UtmGroupBy } from "@/actions/utm-actions";
import { useWorkspaceFilters } from "@/hooks/useWorkspaceFilters";

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

interface ActionReportItem {
  name: string;
  sales: number;
  revenue: number;
  sales_pending: number;
  pending_revenue: number;
  sales_refunded: number;
  refund_revenue: number;
  sales_total: number;
  gross_revenue: number;
  spent: number;
  clicks: number;
  impressions: number;
  atc: number;
  ic: number;
  page_views: number;
  leads: number;
  conversations: number;
  profit: number;
  total_spent: number;
  roas: number;
  roi: number;
  margin: number;
  arpu: number;
  cpa: number;
  cpc: number;
  cpm: number;
  cpp: number;
  cpt: number;
  cpl: number;
  cpi: number;
  cost_per_convo: number;
  cpv: number;
  cps: number;
  icr: number;
  conversion_rate: number;
  ctr: number;
  frequency: number;
  con_rate: number;
  taxes: number;
  product_costs: number;
  video_retention: number;
  hook_rate: number;
  hold_rate: number;
  followers: number;
  budget: number;
  bid_cap: number;
  status: string;
  cycle: string;
  card: string;
  ids: string;
  last_updated: string;
  ad_account: string;
  creation_date: string;
  delivery_status: string;
}

type ColumnDefHelper = { accessorKey?: string; id?: string };

export default function UtmsReportPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = authClient.useSession();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [data, setData] = useState<UtmRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [groupBy, setGroupBy] = useState<UtmGroupBy>("utm_campaign");

  // 🔥 ESTADO DOS BOTÕES DE PLATAFORMA
  const [platforms, setPlatforms] = useState<("meta" | "google")[]>([
    "meta",
    "google",
  ]);

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedColumns = localStorage.getItem("utms_table_columns");
      if (savedColumns) {
        try {
          const parsed = JSON.parse(savedColumns);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Erro ao carregar colunas", e);
        }
      }
    }
    return DEFAULT_COLUMNS;
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [contaFilter, setContaFilter] = useState<string[]>(["all"]);
  const [produtoFilter, setProdutoFilter] = useState<string[]>(["all"]);
  const [productSearch, setProductSearch] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showValues, setShowValues] = useState(true);

  const { accounts, products } = useWorkspaceFilters();

  const handleToggleFilter = (
    id: string,
    currentSelection: string[],
    setSelection: (val: string[]) => void,
  ) => {
    if (id === "all") return setSelection(["all"]);
    let newSelection = currentSelection.filter((c) => c !== "all");
    if (newSelection.includes(id))
      newSelection = newSelection.filter((c) => c !== id);
    else newSelection.push(id);
    if (newSelection.length === 0) newSelection = ["all"];
    setSelection(newSelection);
  };

  const handleSaveColumns = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    if (typeof window !== "undefined") {
      localStorage.setItem("utms_table_columns", JSON.stringify(newOrder));
      toast.success("Colunas salvas com sucesso!");
    }
  };

  // 🔥 LÓGICA DE TOGGLE DOS BOTÕES
  const togglePlatform = (platform: "meta" | "google") => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  // 🔥 ACTION AGORA RECEBE E ENVIA OS BOTÕES DE PLATAFORMA (activePlatforms)
  const fetchUtmData = async (
    currentSlug: string,
    currentGroupBy: UtmGroupBy,
    fromDate: Date,
    toDate?: Date,
    prodIds?: string[],
    accIds?: string[],
    activePlatforms?: ("meta" | "google")[],
  ) => {
    setIsLoading(true);

    const res = await getUtmReport(
      currentSlug,
      currentGroupBy,
      fromDate,
      toDate || new Date(),
      prodIds,
      accIds,
      activePlatforms,
    );

    if (res.success && res.data) {
      const rawData = res.data as unknown as ActionReportItem[];

      const mappedData = rawData.map((item, index) => ({
        id: `row-${index}`,
        [currentGroupBy]: item.name,
        ...item,
      }));

      setData(mappedData as unknown as UtmRow[]);
    } else {
      toast.error("Erro ao carregar os dados de UTMs.");
    }

    setIsLoading(false);
    setIsRefreshing(false);
  };

  // 🔥 O useEffect AGORA ESCUTA O ESTADO `platforms`!
  // Se clicar no botão Meta/Google, ele recarrega a tabela respeitando a trava da Action.
  useEffect(() => {
    if (slug && date?.from) {
      fetchUtmData(
        slug,
        groupBy,
        date.from,
        date.to,
        produtoFilter,
        contaFilter,
        platforms,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    slug,
    groupBy,
    date?.from,
    date?.to,
    produtoFilter,
    contaFilter,
    platforms,
  ]);

  const handleRefresh = () => {
    if (slug && date?.from) {
      setIsRefreshing(true);
      fetchUtmData(
        slug,
        groupBy,
        date.from,
        date.to,
        produtoFilter,
        contaFilter,
        platforms,
      );
      toast.info("Atualizando métricas...");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  // Filtro visual rápido (Fallback)
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowName = String(row[groupBy as keyof UtmRow] || "").toLowerCase();
      if (searchQuery && !rowName.includes(searchQuery.toLowerCase()))
        return false;

      const isMeta =
        rowName.includes("fb") ||
        rowName.includes("ig") ||
        rowName.includes("meta") ||
        rowName.includes("facebook") ||
        rowName.includes("instagram");
      const isGoogle =
        rowName.includes("google") ||
        rowName.includes("ads") ||
        rowName.includes("search") ||
        rowName.includes("youtube") ||
        rowName.includes("yt") ||
        rowName.includes("gdn");

      if (isMeta && !platforms.includes("meta")) return false;
      if (isGoogle && !platforms.includes("google")) return false;

      return true;
    });
  }, [data, platforms, searchQuery, groupBy]);

  const activeColumns = useMemo(() => {
    const allColumnDefs = getColumns(groupBy);
    const mainColumn = allColumnDefs[0];
    const metricColumns = allColumnDefs.slice(1).filter((col) => {
      const colDef = col as ColumnDefHelper;
      const colKey = colDef.accessorKey || colDef.id;
      return colKey && columnOrder.includes(colKey);
    });
    const sortedMetrics = metricColumns.sort((a, b) => {
      const aDef = a as ColumnDefHelper;
      const bDef = b as ColumnDefHelper;
      const aKey = aDef.accessorKey || aDef.id || "";
      const bKey = bDef.accessorKey || bDef.id || "";
      return columnOrder.indexOf(aKey) - columnOrder.indexOf(bKey);
    });
    return [mainColumn, ...sortedMetrics];
  }, [groupBy, columnOrder]);

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    toast.info("Gerando arquivo CSV...");

    // Pega as colunas ativas na tela (O agrupamento atual + as métricas do seletor)
    const activeKeys = [groupBy, ...columnOrder];

    // Chama a nossa nova função isolada
    const success = exportToCsv(filteredData, activeKeys, "relatorio_utms");

    if (success) {
      toast.success("Download concluído!");
    }
  };

  const currentUser = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    image: "",
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative">
      {isHeaderVisible && (
        <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30">
          <MarketingHeader
            user={currentUser}
            hideControls={true}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            showValues={showValues}
            setShowValues={setShowValues}
            onSave={() => {}}
            onReset={() => {}}
          />
        </div>
      )}

      <div className="flex-1 p-6 min-h-0 w-full flex flex-col transition-all duration-300">
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
                  variant="utms"
                />
                <div className="w-px h-4 bg-border/60 mx-1" />
                <button
                  onClick={() => togglePlatform("meta")}
                  className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all cursor-pointer",
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
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all cursor-pointer",
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
                  className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
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
                className="h-9 gap-2 bg-transparent hover:bg-muted cursor-pointer"
                onClick={handleExport}
              >
                <Download size={14} /> Exportar
              </Button>
              <Button
                size="sm"
                className="group/btn relative overflow-hidden px-5 w-36 h-8 rounded-md border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-80 cursor-pointer"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-0 group-hover/btn:duration-[1200ms] ease-out" />
                {(isRefreshing || isLoading) && (
                  <RefreshCw size={14} className="animate-spin mr-2" />
                )}
                {isRefreshing || isLoading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>

          <div className="shrink-0 p-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-border/60 bg-transparent relative z-10">
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Agrupar por
              </label>
              <Select
                value={groupBy}
                onValueChange={(v) => setGroupBy(v as UtmGroupBy)}
              >
                <SelectTrigger className="h-9 w-full bg-background border-border cursor-pointer">
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

            {/* POPOVER DE PRODUTO IDENTICO AO META */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Produto
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between border-border bg-background/50 text-foreground font-normal px-3 cursor-pointer"
                  >
                    <span className="truncate text-sm">
                      {produtoFilter.includes("all")
                        ? "Qualquer"
                        : `${produtoFilter.length} selecionado(s)`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-2 border-border bg-background shadow-xl rounded-xl">
                  <div className="flex flex-col gap-1">
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Pesquisar..."
                        className="h-8 pl-8 bg-muted/50 border-border text-xs"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto flex flex-col gap-1">
                      {productSearch === "" && (
                        <div
                          onClick={() =>
                            handleToggleFilter(
                              "all",
                              produtoFilter,
                              setProdutoFilter,
                            )
                          }
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                              produtoFilter.includes("all")
                                ? "bg-blue-600 border-blue-600"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {produtoFilter.includes("all") && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            Selecionar todos
                          </span>
                        </div>
                      )}
                      {filteredProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() =>
                            handleToggleFilter(
                              prod.id,
                              produtoFilter,
                              setProdutoFilter,
                            )
                          }
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                              produtoFilter.includes(prod.id)
                                ? "bg-blue-600 border-blue-600"
                                : "border-muted-foreground/30",
                            )}
                          >
                            {produtoFilter.includes(prod.id) && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground truncate">
                            {prod.name}
                          </span>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <span className="text-xs text-muted-foreground p-2 text-center">
                          Nenhum produto cadastrado.
                        </span>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* POPOVER DE CONTA IDENTICO AO META */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Conta
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 w-full justify-between border-border bg-background/50 text-foreground font-normal px-3 cursor-pointer"
                  >
                    <span className="truncate text-sm">
                      {contaFilter.includes("all")
                        ? "Qualquer"
                        : `${contaFilter.length} selecionada(s)`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-2 border-border bg-background shadow-xl rounded-xl">
                  <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto">
                    <div
                      onClick={() =>
                        handleToggleFilter("all", contaFilter, setContaFilter)
                      }
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                          contaFilter.includes("all")
                            ? "bg-blue-600 border-blue-600"
                            : "border-muted-foreground/30",
                        )}
                      >
                        {contaFilter.includes("all") && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        Selecionar todas
                      </span>
                    </div>

                    {accounts.length > 0 && (
                      <div className="h-px bg-border/50 my-1 w-full" />
                    )}

                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        onClick={() =>
                          handleToggleFilter(
                            acc.id,
                            contaFilter,
                            setContaFilter,
                          )
                        }
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded-[4px] border flex items-center justify-center transition-colors",
                            contaFilter.includes(acc.id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {contaFilter.includes(acc.id) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {acc.name}
                        </span>
                      </div>
                    ))}
                    {accounts.length === 0 && (
                      <span className="text-xs text-muted-foreground text-center p-3">
                        Nenhuma conta encontrada.
                      </span>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Período
              </label>
              <DatePickerWithRange
                date={date}
                setDate={setDate}
                className="w-full h-9 bg-background"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-[10px] font-semibold text-muted-foreground/80 uppercase">
                Pesquisar
              </label>
              <div className="flex gap-2 relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Filtrar..."
                  className="h-9 pl-9 w-full bg-background border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-background border-border cursor-pointer"
                >
                  <Filter size={14} />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative bg-background rounded-b-xl overflow-hidden flex flex-col z-0">
            <ReportingTable
              columns={activeColumns as ReturnType<typeof getColumns>}
              data={filteredData}
              pageSize={100}
              enableResizing={true}
              hidePagination={true}
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
