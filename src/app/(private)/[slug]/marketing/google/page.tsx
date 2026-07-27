"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  AlertTriangle,
  Info,
  Copy,
  Trash,
  Play,
  Pause,
  DollarSign,
  FolderPlus,
  LayoutGrid,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// COMPONENTS
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { ColumnCustomizer } from "@/components/marketing/ColumnCustomizer";
import { DiagnosticModal } from "@/components/marketing/DiagnosticModal";
import { BudgetModal } from "@/components/marketing/BudgetModal";
import { DuplicateModal } from "@/components/marketing/DuplicateModal";
import { ReportingTable } from "@/components/data-table/ReportingTable";

// DADOS E COLUNAS (Certifique-se de que o columns.tsx do Google também esteja adaptado para "grupos")
import { getColumns } from "./columns";
// Definição de tipo local para evitar erros se o types.ts não estiver atualizado
type GoogleCampaign = any;

// --- MOCK DATA GENERATOR (Adaptado para Google) ---
const generateMockData = (prefix: string, count: number): GoogleCampaign[] => {
  return Array.from({ length: count }).map((_, i) => {
    let budgetValue: number | null = 50 + i * 5;

    // No Google também temos Campanhas > Grupos > Anúncios
    if (prefix === "CP") {
      if (i % 3 === 0) budgetValue = null;
    } else if (prefix === "AD") {
      budgetValue = null;
    }

    return {
      id: `${prefix === "AD" ? "G_AD" : prefix === "GP" ? "G_GP" : "G_CP"}${i}`,
      status: i % 3 === 0 ? "ACTIVE" : "PAUSED",
      // Ajuste de nomenclatura: Conjunto -> Grupo
      name: `${
        prefix === "AD" ? "Anúncio" : prefix === "GP" ? "Grupo" : "Campanha"
      } ${i + 1} - [Search]`,
      budget: budgetValue,
      sales: Math.floor(Math.random() * 100),
      cpa: 10 + Math.random() * 20,
      spent: 200 + i * 20,
      revenue: 500 + i * 50,
      profit: 300 + i * 30,
      roas: 1.5 + Math.random() * 3,
      margin: 20 + Math.random() * 30,
      roi: 1.2 + Math.random(),
      ic: 50 + i,
      clicks: 1000 + i * 100,
      ctr: 1.5 + Math.random(),
      impressions: 5000 + i * 1000,

      // Campos específicos que podem ser úteis para Google
      optimization_score: Math.floor(Math.random() * 100),
      interaction_rate: (Math.random() * 2).toFixed(2),
    };
  });
};

const DEFAULT_COLUMNS = [
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
  "clicks",
  "cpc",
  "ctr",
  "impressions",
];

// Ajuste de Labels para terminologia do Google (Grupos em vez de Conjuntos)
const LEVEL_LABELS: Record<string, { nameLabel: string; statusLabel: string }> =
  {
    campanhas: {
      nameLabel: "Nome da Campanha",
      statusLabel: "Status da Campanha",
    },
    grupos: {
      // Mudado de 'conjuntos' para 'grupos'
      nameLabel: "Nome do Grupo",
      statusLabel: "Status do Grupo",
    },
    anuncios: {
      nameLabel: "Nome do Anúncio",
      statusLabel: "Status do Anúncio",
    },
  };

export default function GerenciadorGoogleAdsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [activeLevel, setActiveLevel] = useState("campanhas");
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_COLUMNS);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Modais
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

  const [currentData, setCurrentData] = useState<GoogleCampaign[]>([]);
  const [selectedRows, setSelectedRows] = useState<GoogleCampaign[]>([]);

  useEffect(() => {
    // Prefixos adaptados: GP = Grupo (Google), CJ = Conjunto (Meta)
    const prefix =
      activeLevel === "anuncios"
        ? "AD"
        : activeLevel === "grupos"
          ? "GP"
          : "CP";
    const count = activeLevel === "anuncios" ? 50 : 30;
    setCurrentData(generateMockData(prefix, count));
    setSelectedRows([]);
  }, [activeLevel]);

  const handleBudgetSave = (newValue: number) => {
    const selectedIds = selectedRows.map((row) => row.id);
    const newData = currentData.map((item) => {
      if (selectedIds.includes(item.id)) {
        return { ...item, budget: newValue };
      }
      return item;
    });
    setCurrentData(newData);
    toast.success(`${selectedIds.length} itens atualizados`, {
      description: `Orçamento alterado para R$ ${newValue.toFixed(2)}.`,
    });
  };

  const handleDuplicateConfirm = (data: {
    mode: "same" | "other";
    targetAccount?: string;
    copies: number;
  }) => {
    // Lógica de duplicação (mantida igual)
    const selectedIds = selectedRows.map((row) => row.id);
    if (data.mode === "other") {
      toast.success(`Transferência iniciada!`, {
        description: `${selectedIds.length} itens copiados para a conta ${data.targetAccount}.`,
      });
      return;
    }
    let newItems: GoogleCampaign[] = [];
    selectedRows.forEach((item) => {
      for (let i = 0; i < data.copies; i++) {
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
        toast.success("Itens pausados.");
        break;
      case "duplicate":
        setIsDuplicateOpen(true);
        return;
      case "delete":
        newData = newData.filter((item) => !selectedIds.includes(item.id));
        toast.error("Itens excluídos.");
        break;
      case "budget":
        setIsBudgetOpen(true);
        return;
    }
    setCurrentData(newData);
  };

  // 🔥 URL DO GOOGLE ADS
  const handleOpenAdsManager = () => {
    if (selectedRows.length === 0) return;
    window.open("https://ads.google.com/aw/campaigns", "_blank");
  };

  const activeColumns = useMemo(() => {
    const allColumnDefs = getColumns(activeLevel); // Certifique-se que getColumns aceita "grupos"
    const visibleCols = [];
    const fixedStartCols = ["select", "status"];
    const finalOrder = [
      ...fixedStartCols,
      ...columnOrder.filter((id) => !fixedStartCols.includes(id)),
    ];

    finalOrder.forEach((colId) => {
      const colDef = allColumnDefs.find((def) => {
        return (def as any).accessorKey === colId || def.id === colId;
      });
      if (colDef) visibleCols.push(colDef);
    });
    return visibleCols;
  }, [columnOrder, activeLevel]);

  const labels = LEVEL_LABELS[activeLevel] || LEVEL_LABELS["anuncios"];

  const { data: session } = authClient.useSession();
  const currentUser = {
    name: session?.user?.name || "Usuário",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      {isHeaderVisible && (
        <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30 animate-in slide-in-from-top-2 duration-200">
          {/* Header Genérico ou específico se tiver um GoogleMarketingHeader */}
          <MarketingHeader user={currentUser} hideControls={true} />
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
              <TabsList className="bg-transparent border-none w-full flex justify-start rounded-none p-0 h-auto gap-0">
                {[
                  { id: "contas", icon: BarChart3, label: "Contas" },
                  { id: "campanhas", icon: FolderPlus, label: "Campanhas" },
                  // 🔥 Alterado para GRUPOS (Google)
                  {
                    id: "grupos",
                    icon: LayoutGrid,
                    label: "Grupos de Anúncio",
                  },
                  { id: "anuncios", icon: Image, label: "Anúncios" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative rounded-none border-b-0 py-5 px-8 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[15px] text-muted-foreground hover:text-foreground",
                      "data-[state=active]:text-white",
                      "data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px]",
                      "after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                      "data-[state=active]:after:scale-x-100",
                      // Cor Google (Amarelo/Azul/Verde/Vermelho) - mantive azul para consistência ou pode trocar para border-blue-500
                      "data-[state=active]:after:bg-blue-500",
                      "data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.8)]",
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
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground relative z-10 hover:border-border/60"
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
                        className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground relative z-10 hover:border-border/60 group"
                      >
                        <Activity
                          size={16}
                          className="group-hover:text-blue-500 transition-colors"
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[300px] bg-black text-white border-zinc-800 text-xs p-3"
                    >
                      <p>
                        Verifique o status de otimização da sua conta Google
                        Ads.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div
                  className={cn(
                    "flex items-center rounded-md border bg-background overflow-hidden h-8 relative z-10 transition-colors",
                    selectedRows.length > 0
                      ? "border-blue-500/50 shadow-sm"
                      : "border-border",
                  )}
                >
                  <button
                    onClick={handleOpenAdsManager}
                    disabled={selectedRows.length === 0}
                    className={cn(
                      "flex items-center gap-2 px-3 h-full text-sm font-medium border-r transition-colors relative z-10",
                      selectedRows.length > 0
                        ? "text-blue-500 hover:bg-blue-500/10 hover:text-blue-600 border-blue-500/30 cursor-pointer"
                        : "text-muted-foreground/50 border-border cursor-not-allowed",
                    )}
                  >
                    <ExternalLink size={14} /> Abrir no gerenciador
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="px-2 h-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground hover:border-border/60 relative z-10 outline-none">
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
                      <DropdownMenuSeparator className="bg-zinc-800" />
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
                      <DropdownMenuItem className="gap-2 focus:bg-zinc-800 focus:text-white cursor-pointer text-xs">
                        <Target size={14} /> Alterar bid cap (CPA/CPC)
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
                {/* Status específico do Google (opcional) */}
                <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide border border-green-500/20 uppercase relative z-10">
                  <Activity size={13} strokeWidth={2.5} /> Status da Conta: OK
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <span className="text-xs text-muted-foreground font-medium relative z-10">
                  Atualizado há 1 min
                </span>
                <button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-all shadow-sm relative z-10">
                  Atualizar
                </button>
              </div>
            </div>

            <div className="shrink-0 p-4 grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-border/60 bg-transparent relative z-10">
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  {labels.nameLabel}
                </label>
                <Input
                  placeholder="Filtrar..."
                  className="h-9 bg-background/50 border-border w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  {labels.statusLabel}
                </label>
                <Select defaultValue="qualquer">
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
                  Período
                </label>
                <DatePickerWithRange
                  date={date}
                  setDate={setDate}
                  className="w-full h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  Conta
                </label>
                <Select defaultValue="qualquer">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-medium text-muted-foreground/80">
                  Produto
                </label>
                <Select defaultValue="qualquer">
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 min-h-0 min-w-0 w-full bg-transparent overflow-hidden relative z-0">
              {/* Note que adicionei "grupos" na verificação */}
              {["campanhas", "grupos", "anuncios"].includes(activeLevel) ? (
                <ReportingTable
                  columns={activeColumns as any}
                  data={currentData}
                  pageSize={40}
                  hidePagination={true}
                  enableResizing={true}
                  onSelectionChange={setSelectedRows}
                  classNames={{
                    container: "rounded-none border-0 shadow-none h-full",
                    headerRow: "bg-card",
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/70 p-10 text-sm">
                  Em construção...
                </div>
              )}
            </div>
          </Tabs>
        </PremiumCard>

        <div className="mt-2 flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/50 max-w-2xl">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p>
            <strong>Nota sobre Google Ads:</strong>
            <br />
            As métricas podem ter um atraso de até 3 horas em relação ao painel
            oficial do Google.
          </p>
        </div>
      </div>

      <DiagnosticModal
        open={isDiagnosticOpen}
        onOpenChange={setIsDiagnosticOpen}
      />
      <BudgetModal
        open={isBudgetOpen}
        onOpenChange={setIsBudgetOpen}
        onConfirm={handleBudgetSave}
        count={selectedRows.length}
      />
      <DuplicateModal
        open={isDuplicateOpen}
        onOpenChange={setIsDuplicateOpen}
        onConfirm={handleDuplicateConfirm}
        level={activeLevel}
        count={selectedRows.length}
      />
    </div>
  );
}
