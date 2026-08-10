"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import {
  BarChart3,
  Target,
  Image,
  ArrowUpFromLine,
  ArrowDownToLine,
  Activity,
  ExternalLink,
  ChevronDown,
  Info,
  Copy,
  Trash,
  Play,
  Pause,
  DollarSign,
  FolderPlus,
  LayoutGrid,
  Search,
  Check,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DatePickerWithRange } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { ReportingTable } from "@/components/data-table/ReportingTable";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { ColumnCustomizer } from "@/components/marketing/ColumnCustomizer";
import { DiagnosticModal } from "@/components/marketing/DiagnosticModal";
import { BudgetModal } from "@/components/marketing/BudgetModal";
import { DuplicateModal } from "@/components/marketing/DuplicateModal";

import { getColumns } from "./columns";

// TIPAGEM ESTRITA GOOGLE
export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  sales: number;
  cpa: number;
  spent: number;
  revenue: number;
  profit: number;
  roas: number;
  margin: number;
  roi: number;
  [key: string]: unknown;
}

// LABELS PARA OS FILTROS
const LEVEL_LABELS: Record<string, { nameLabel: string; statusLabel: string }> =
  {
    contas: { nameLabel: "Nome da Conta", statusLabel: "Status da Conta" },
    campanhas: {
      nameLabel: "Nome da Campanha",
      statusLabel: "Status da Campanha",
    },
    grupos: { nameLabel: "Nome do Grupo", statusLabel: "Status do Grupo" },
    anuncios: {
      nameLabel: "Nome do Anúncio",
      statusLabel: "Status do Anúncio",
    },
  };

// GERADOR DE DADOS FAKE GOOGLE
const generateMockData = (prefix: string, count: number): GoogleCampaign[] => {
  return Array.from({ length: count }).map((_, i) => {
    let budgetValue: number | null = 50 + i * 5;

    if (prefix === "CP") {
      if (i % 3 === 0) budgetValue = null;
    } else if (prefix === "AD") {
      budgetValue = null;
    }

    return {
      id: `${prefix === "AD" ? "G_AD" : prefix === "GP" ? "G_GP" : "G_CP"}${i}`,
      status: i % 3 === 0 ? "PAUSED" : "ACTIVE",
      name: `${prefix === "AD" ? "Anúncio" : prefix === "GP" ? "Grupo" : "Campanha"} ${i + 1} - [Search]`,
      budget: budgetValue,
      sales: Math.floor(Math.random() * 100),
      cpa: 10 + Math.random() * 20,
      spent: 200 + i * 20,
      revenue: 500 + i * 50,
      profit: 300 + i * 30,
      roas: 1.5 + Math.random() * 3,
      margin: 20 + Math.random() * 30,
      roi: 1.2 + Math.random(),
    };
  });
};

export default function GerenciadorGoogleAdsPage() {
  const { data: session } = authClient.useSession();

  // ESTADOS PRINCIPAIS E COLUNAS
  const [activeLevel, setActiveLevel] = useState("campanhas");
  const [columnOrder, setColumnOrder] = useState<string[]>([
    "name",
    "budget",
    "sales",
    "cpa",
    "spent",
    "revenue",
    "profit",
    "roas",
    "margin",
    "roi",
  ]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // ESTADOS DO HEADER E ATUALIZAÇÃO
  const [isEditing, setIsEditing] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeText, setTimeText] = useState("agora mesmo");
  const [dotColor, setDotColor] = useState(
    "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
  );
  const [untrackedSalesCount, setUntrackedSalesCount] = useState<number>(0);

  // ESTADOS DOS FILTROS
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("qualquer");
  const [contaFilter, setContaFilter] = useState<string[]>(["all"]);
  const [produtoFilter, setProdutoFilter] = useState<string[]>(["all"]);
  const [productSearch, setProductSearch] = useState("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // ESTADOS FAKES PARA OS DROPDOWNS
  const [dbAdAccounts] = useState<{ id: string; name: string }[]>([]);
  const [dbProducts] = useState<
    { id: string; name: string; sku?: string | null }[]
  >([]);

  // ESTADOS DA TABELA E MODAIS
  const [currentData, setCurrentData] = useState<GoogleCampaign[]>([]);
  const [selectedRows, setSelectedRows] = useState<GoogleCampaign[]>([]);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

  // TÍTULO DA GUIA DINÂMICO
  useEffect(() => {
    const titles: Record<string, string> = {
      contas: "Contas",
      campanhas: "Campanhas",
      grupos: "Grupos de Anúncios",
      anuncios: "Anúncios",
    };
    document.title = titles[activeLevel] || "Dashboard";
  }, [activeLevel]);

  // FUNÇÃO DE BUSCA E SIMULAÇÃO
  const handleFetchData = useCallback(
    (manual = false) => {
      setIsUpdating(true);

      // Simula o tempo de requisição de uma API real
      setTimeout(() => {
        const prefix =
          activeLevel === "anuncios"
            ? "AD"
            : activeLevel === "grupos"
              ? "GP"
              : "CP";
        const count = activeLevel === "anuncios" ? 50 : 30;

        let fakeData = generateMockData(prefix, count);

        if (nameFilter) {
          fakeData = fakeData.filter((item) =>
            item.name.toLowerCase().includes(nameFilter.toLowerCase()),
          );
        }
        if (statusFilter !== "qualquer") {
          fakeData = fakeData.filter(
            (item) => item.status.toLowerCase() === statusFilter.toLowerCase(),
          );
        }

        setCurrentData(fakeData);
        setLastUpdated(new Date());
        setIsUpdating(false);

        if (manual) toast.success("Dados sincronizados com o Google Ads!");
      }, 800);
    },
    [activeLevel, nameFilter, statusFilter],
  );

  // ATUALIZA QUANDO OS FILTROS MUDAM
  useEffect(() => {
    // O setTimeout de 0ms joga a atualização para o fim da fila, evitando o erro de "cascading renders"
    const timer = setTimeout(() => {
      handleFetchData(false);
      setSelectedRows([]);
    }, 0);

    return () => clearTimeout(timer);
  }, [activeLevel, nameFilter, statusFilter, handleFetchData]);

  // RELÓGIO DE ATUALIZAÇÃO
  useEffect(() => {
    if (!lastUpdated) return;
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.floor((now - lastUpdated.getTime()) / 60000);
      if (diff < 1) {
        setTimeText("agora mesmo");
        setDotColor("bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]");
      } else if (diff < 60) {
        setTimeText(`há ${diff} min`);
        setDotColor(
          diff >= 5
            ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
        );
      } else {
        const hours = Math.floor(diff / 60);
        setTimeText(`há ${hours} h`);
        setDotColor("bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]");
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

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

  const handleBudgetSave = (newValue: number) => {
    const selectedIds = selectedRows.map((row) => row.id);
    const newData = currentData.map((item) => {
      if (selectedIds.includes(item.id)) return { ...item, budget: newValue };
      return item;
    });
    setCurrentData(newData);
    toast.success(`${selectedIds.length} itens atualizados`, {
      description: `Orçamento alterado para R$ ${newValue.toFixed(2)}.`,
    });
    setIsBudgetOpen(false);
  };

  const handleDuplicateConfirm = (data: {
    mode: "same" | "other";
    targetAccountId?: string;
    copiesCount: number;
  }) => {
    const selectedIds = selectedRows.map((row) => row.id);
    if (data.mode === "other") {
      toast.success("Transferência iniciada!", {
        description: `${selectedIds.length} itens copiados para a conta ${data.targetAccountId}.`,
      });
      setIsDuplicateOpen(false);
      return;
    }

    const newItems: GoogleCampaign[] = [];
    selectedRows.forEach((item) => {
      for (let i = 0; i < data.copiesCount; i++) {
        newItems.push({
          ...item,
          id: `${item.id}_copy_${Date.now()}_${i}`,
          name: `${item.name} - Cópia ${i + 1}`,
          status: "PAUSED",
        });
      }
    });

    setCurrentData((prev) => [...newItems, ...prev]);
    toast.success("Duplicação realizada", {
      description: `${newItems.length} itens criados.`,
    });
    setIsDuplicateOpen(false);
  };

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      toast.warning("Selecione pelo menos um item");
      return;
    }

    const selectedIds = selectedRows.map((row) => row.id);
    let newData = [...currentData];

    switch (action) {
      case "activate":
        newData = newData.map((item) =>
          selectedIds.includes(item.id) ? { ...item, status: "ACTIVE" } : item,
        );
        toast.success("Itens ativados.");
        break;
      case "deactivate":
        newData = newData.map((item) =>
          selectedIds.includes(item.id) ? { ...item, status: "PAUSED" } : item,
        );
        toast.success("Itens desativados.");
        break;
      case "duplicate":
        setIsDuplicateOpen(true);
        return;
      case "budget":
        setIsBudgetOpen(true);
        return;
      case "delete":
        newData = newData.filter((item) => !selectedIds.includes(item.id));
        toast.success("Itens excluídos (Simulação).");
        setSelectedRows([]);
        break;
    }
    setCurrentData(newData);
  };

  const activeColumns = useMemo(() => {
    const allColumnDefs = getColumns(activeLevel);
    const visibleCols: typeof allColumnDefs = [];
    const fixedStartCols = ["select", "status"];

    const finalOrder = [
      ...fixedStartCols,
      ...columnOrder.filter((id) => !fixedStartCols.includes(id)),
    ];

    finalOrder.forEach((colId) => {
      const colDef = allColumnDefs.find((def) => {
        return (
          (def as { accessorKey?: string }).accessorKey === colId ||
          def.id === colId
        );
      });
      if (colDef) visibleCols.push(colDef);
    });

    return visibleCols;
  }, [columnOrder, activeLevel]);

  const labels = LEVEL_LABELS[activeLevel] || LEVEL_LABELS["anuncios"];
  const currentUser = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };
  const filteredProducts = dbProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative">
      {isHeaderVisible && (
        <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30 animate-in slide-in-from-top-2 duration-200">
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
        <PremiumCard className="w-full flex-1 p-0 flex flex-col overflow-hidden relative z-0">
          <Tabs
            value={activeLevel}
            onValueChange={setActiveLevel}
            className="w-full flex flex-col h-full relative z-0"
          >
            <div className="shrink-0 border-b border-border/60 w-full relative z-10">
              <TabsList className="bg-transparent border-none w-full flex justify-start rounded-none p-0 h-auto gap-0 overflow-x-auto custom-scrollbar">
                {[
                  { id: "contas", icon: BarChart3, label: "Contas" },
                  { id: "campanhas", icon: FolderPlus, label: "Campanhas" },
                  {
                    id: "grupos",
                    icon: LayoutGrid,
                    label: "Grupos de Anúncios",
                  },
                  { id: "anuncios", icon: Image, label: "Anúncios" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative rounded-none border-b-0 py-5 px-8 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[15px] text-muted-foreground hover:text-foreground",
                      "data-[state=active]:text-black data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                      "data-[state=active]:after:scale-x-100 data-[state=active]:after:bg-blue-500 data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.8)]",
                    )}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex flex-wrap items-center justify-between p-4 border-b border-border/60 bg-transparent gap-4 relative z-10">
              <div className="flex items-center gap-3 relative z-10">
                <ColumnCustomizer
                  currentColumns={columnOrder}
                  onSave={setColumnOrder}
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsHeaderVisible(!isHeaderVisible)}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hover:border-border/60"
                      >
                        {isHeaderVisible ? (
                          <ArrowUpFromLine size={16} />
                        ) : (
                          <ArrowDownToLine size={16} />
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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsDiagnosticOpen(true)}
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hover:border-border/60 group/icon"
                      >
                        <Activity
                          size={16}
                          className="group-hover/icon:text-blue-500 transition-colors"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[300px] bg-black text-white border-zinc-800 text-xs p-3"
                    >
                      <p>Diagnóstico de integração da campanha.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div
                  className={cn(
                    "flex items-center rounded-md border bg-background overflow-hidden h-8 transition-colors",
                    selectedRows.length > 0
                      ? "border-blue-500/50 shadow-sm"
                      : "border-border",
                  )}
                >
                  <button
                    disabled={selectedRows.length === 0}
                    className={cn(
                      "flex items-center gap-2 px-3 h-full text-sm font-medium border-r transition-colors",
                      selectedRows.length > 0
                        ? "text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 border-blue-500/30 cursor-pointer"
                        : "text-muted-foreground/50 border-border cursor-not-allowed",
                    )}
                  >
                    <ExternalLink size={14} /> Abrir no gerenciador
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="px-2 h-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hover:border-border/60 outline-none">
                        <ChevronDown size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 bg-[#1A1D21] border-zinc-800 text-zinc-300"
                    >
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        {selectedRows.length > 0
                          ? `${selectedRows.length} itens selecionados`
                          : "Ações"}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("duplicate")}
                        className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs"
                      >
                        <Copy size={14} /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("activate")}
                        className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs"
                      >
                        <Play size={14} /> Ativar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("deactivate")}
                        className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs"
                      >
                        <Pause size={14} /> Desativar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("budget")}
                        className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs"
                      >
                        <DollarSign size={14} /> Alterar orçamento
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        className="gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-xs"
                      >
                        <Trash size={14} /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isUpdating ? (
                  <div className="flex items-center gap-2 bg-muted/50 text-muted-foreground px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-border transition-all">
                    <Search className="w-3.5 h-3.5 animate-pulse" />{" "}
                    Identificando vendas...
                  </div>
                ) : untrackedSalesCount > 0 ? (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-orange-500/20 uppercase transition-all">
                    <AlertTriangle size={13} strokeWidth={2.5} />{" "}
                    {untrackedSalesCount} não trackeadas
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-green-500/20 transition-all">
                    <CheckCircle2 size={13} strokeWidth={2.5} /> Todas as vendas
                    trackeadas
                  </div>
                )}
              </div>

              {/* BARRA DIREITA COM O BOTÃO ATUALIZAR E O RELÓGIO (RESTAURADOS) */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors duration-500",
                      dotColor,
                    )}
                  />{" "}
                  Atualizado {timeText}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleFetchData(true)}
                  disabled={isUpdating}
                  className="group/btn relative overflow-hidden px-5 w-36 h-8 rounded-md border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-80 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-0 group-hover/btn:duration-[1200ms] ease-out" />
                  {isUpdating ? (
                    <span className="flex items-center gap-2 text-white font-medium relative z-10">
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

            <div className="shrink-0 p-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-border/60 bg-transparent relative z-10">
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  {labels.nameLabel}
                </label>
                <Input
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Filtrar por nome"
                  className="h-9 bg-background/50 border-border w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  {labels.statusLabel}
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  Período de Visualização
                </label>
                <DatePickerWithRange
                  date={date}
                  setDate={setDate}
                  className="w-full h-9"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  Conta de Anúncio
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-between border-border bg-background/50 text-foreground font-normal px-3"
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
                      {dbAdAccounts.length > 0 && (
                        <div className="h-px bg-border/50 my-1 w-full" />
                      )}
                      {dbAdAccounts.map((acc) => (
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
                      {dbAdAccounts.length === 0 && (
                        <span className="text-xs text-muted-foreground text-center p-3">
                          Nenhuma conta (Modo Simulação).
                        </span>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  Produto
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-full justify-between border-border bg-background/50 text-foreground font-normal px-3"
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
                            Nenhum produto (Modo Simulação).
                          </span>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex-1 min-h-0 min-w-0 w-full bg-transparent overflow-hidden relative z-0">
              <ReportingTable
                key={`${activeLevel}-${columnOrder.join("-")}`}
                columns={activeColumns as never}
                data={currentData}
                pageSize={40}
                hidePagination={true}
                enableResizing={true}
                onSelectionChange={setSelectedRows}
                classNames={{
                  container:
                    "rounded-none border-0 shadow-none h-full bg-transparent",
                  headerRow: "bg-transparent border-b border-border/40",
                }}
              />

              {currentData.length === 0 && activeLevel !== "contas" && (
                <div className="absolute inset-0 top-[40px] flex flex-col items-start pl-8 pt-12 pointer-events-none">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/70 pointer-events-auto cursor-help group/empty">
                    <span>Por que as campanhas não estão aparecendo?</span>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={16}
                            className="text-muted-foreground group-hover/empty:text-blue-500 transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[320px] bg-[#111317] border border-zinc-800 text-zinc-300 p-4 leading-relaxed text-sm shadow-xl font-medium"
                        >
                          Apenas campanhas não excluídas que foram criadas no
                          período selecionado ou com gastos nesse mesmo período
                          são listadas no relatório.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </PremiumCard>
      </div>

      <DiagnosticModal
        open={isDiagnosticOpen}
        onOpenChange={setIsDiagnosticOpen}
        adAccounts={[]}
        onVerify={async () => {
          toast.success("Google Ads simulado!");
        }}
      />

      <BudgetModal
        open={isBudgetOpen}
        onOpenChange={setIsBudgetOpen}
        onConfirm={handleBudgetSave}
        count={selectedRows.length}
      />

      <DuplicateModal
        isOpen={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        onConfirm={handleDuplicateConfirm}
        adAccounts={[]}
        count={selectedRows.length}
      />
    </div>
  );
}
