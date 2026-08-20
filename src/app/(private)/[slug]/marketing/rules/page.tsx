"use client";

import { useParams } from "next/navigation";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authClient } from "@/lib/auth-client";
import { PLAN_LIMITS, type PlanType } from "@/config/plans";
import {
  Plus,
  Search,
  Upload,
  Download,
  Facebook,
  Info,
  Trash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { CreateRuleModal } from "@/components/marketing/CreateRuleModal";

import { AutomationRule } from "./types";
import { RulesTable } from "@/components/data-table/RulesTable";
import { getColumns } from "./columns";
import {
  getRulesAction,
  createRuleAction,
  deleteRuleAction,
  toggleRuleStatusAction,
  RuleCondition,
} from "@/actions/rules";

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

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  plan?: string;
};

interface ConditionInput {
  metric: string;
  operator: string;
  value: string;
}

interface RuleFormData {
  id?: string;
  name?: string;
  product?: string;
  account?: string;
  adAccounts?: string[];
  scope?: string;
  applyTo?: string;
  action?: string;
  conditions?: ConditionInput[] | string;
  frequency?: string;
  period?: string;
  evaluationPeriod?: string;
  status?: boolean;
}

interface DbCondition {
  metric?: string;
  operator?: string;
  value?: string | number;
}

interface DbRule {
  id: string;
  name: string;
  product?: string;
  adAccounts?: string[];
  applyTo?: string;
  scope?: string;
  action?: string;
  conditions?: DbCondition[] | string;
  frequency?: string;
  evaluationPeriod?: string;
  period?: string;
  isActive?: boolean;
  status?: boolean;
}

const SCOPE_LABELS: Record<string, string> = {
  active_campaigns: "Campanhas Ativas",
  all_campaigns: "Todas as Campanhas",
  active_adsets: "Conjuntos Ativos",
  active_ads: "Anúncios Ativos",
};

const ACTION_LABELS: Record<string, string> = {
  pause: "Pausar",
  enable: "Ativar",
  increase_budget: "Aumentar Orçamento",
  decrease_budget: "Diminuir Orçamento",
  notify: "Notificar",
};

const PERIOD_LABELS: Record<string, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  last_3_days: "Últimos 3 dias",
  last_7_days: "Últimos 7 dias",
  maximum: "Vitalício",
};

const mapPrismaRuleToUI = (dbRule: DbRule): AutomationRule => {
  const rawScope = dbRule.applyTo || dbRule.scope || "";
  const rawPeriod = dbRule.evaluationPeriod || dbRule.period || "";

  // Lê a condição diretamente como está no banco e passa limpa para frente!
  let conditionsList: DbCondition[] | string = [];

  if (typeof dbRule.conditions === "string") {
    try {
      conditionsList = JSON.parse(dbRule.conditions);
    } catch {
      conditionsList = dbRule.conditions; // Mantém fallback da string legada se existir
    }
  } else if (Array.isArray(dbRule.conditions)) {
    conditionsList = dbRule.conditions;
  }

  return {
    id: dbRule.id,
    name: dbRule.name,
    product: dbRule.product === "qualquer" ? "Qualquer" : "Específico",
    account: dbRule.adAccounts?.length ? "Específica" : "Todas",
    scope: SCOPE_LABELS[String(rawScope).toLowerCase()] || rawScope,
    action:
      ACTION_LABELS[String(dbRule.action || "").toLowerCase()] ||
      dbRule.action ||
      "",
    // Passamos o array (ou string) direto para o columns.tsx formatar!
    conditions: conditionsList as unknown as string,
    frequency: dbRule.frequency || "15min",
    period: PERIOD_LABELS[String(rawPeriod).toLowerCase()] || rawPeriod,
    status: dbRule.isActive ?? dbRule.status ?? true,
    rawConfig: dbRule as unknown as Record<string, unknown>,
  };
};

export default function RulesPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const workspaceId = Array.isArray(rawSlug)
    ? rawSlug[0]
    : (rawSlug as string) || "";

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<AutomationRule | null>(null);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = authClient.useSession();

  const rawUser = session?.user as AuthUser | undefined;
  const userId = rawUser?.id || "";

  const role = rawUser?.role || "user";
  const rawPlan = rawUser?.plan?.toUpperCase();
  const plan: PlanType =
    role === "admin"
      ? "PRO"
      : rawPlan && rawPlan in PLAN_LIMITS
        ? (rawPlan as PlanType)
        : "START";

  const currentUser = {
    id: rawUser?.id || "",
    name: rawUser?.name || "Usuário",
    email: rawUser?.email || "",
    image: rawUser?.image || "",
    role,
    plan,
  };

  const maxRules = PLAN_LIMITS[currentUser.plan].rules;
  const isLimitReached = rules.length >= maxRules;

  const openEditModal = useCallback((rule: AutomationRule) => {
    setRuleToEdit(rule);
    setIsCreateModalOpen(true);
  }, []);

  const confirmSingleDelete = useCallback((id: string) => {
    setItemsToDelete([id]);
  }, []);

  const openCreateModal = () => {
    setRuleToEdit(null);
    setIsCreateModalOpen(true);
  };

  const loadRules = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const res = await getRulesAction(workspaceId);
    if (res.success && res.rules) {
      setRules((res.rules as DbRule[]).map(mapPrismaRuleToUI));
    } else {
      setRules([]);
    }
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    const fetchRules = async () => {
      await loadRules();
    };

    fetchRules();
  }, [loadRules]);

  // O Modal já salvou no banco!
  // Aqui no page.tsx nós apenas atualizamos a lista de regras na tela.
  const handleSaveRule = async () => {
    await loadRules();
  };

  const toggleRuleStatus = useCallback(
    async (id: string) => {
      const targetRule = rules.find((r) => r.id === id);
      if (!targetRule) return;

      const res = await toggleRuleStatusAction(id, targetRule.status);

      if (res.success) {
        toast.success("Status atualizado com sucesso!");
        await loadRules();
      } else {
        toast.error(res.error || "Erro ao atualizar status.");
      }
    },
    [rules, loadRules],
  );

  const executeDelete = async () => {
    if (itemsToDelete.length === 0) return;

    const deletePromises = itemsToDelete.map((id) => deleteRuleAction(id));
    const results = await Promise.all(deletePromises);

    const hasError = results.some((r) => !r.success);

    if (!hasError) {
      toast.success(
        itemsToDelete.length > 1
          ? "Regras excluídas com sucesso."
          : "Regra excluída com sucesso.",
      );
      setSelectedRuleIds((prev) =>
        prev.filter((id) => !itemsToDelete.includes(id)),
      );
      setItemsToDelete([]);
      await loadRules();
    } else {
      toast.error("Ocorreu um erro ao excluir uma ou mais regras.");
    }
  };

  // 📤 EXPORTAR REGRAS PARA ARQUIVO JSON
  const handleImportClick = () => {
    // Pequeno atraso para o menu fechar sem bloquear a janela de arquivos do navegador
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedRules = Array.isArray(parsed) ? parsed : [parsed];

        if (importedRules.length === 0) {
          toast.error("O arquivo de importação está vazio.");
          return;
        }

        let successCount = 0;
        let failCount = 0;

        toast.info(`Importando ${importedRules.length} regra(s)...`);

        for (const item of importedRules) {
          if (!item.name || !item.action) {
            failCount++;
            continue;
          }

          let parsedConditions = item.conditions;
          if (typeof item.conditions === "string") {
            try {
              parsedConditions = JSON.parse(item.conditions);
            } catch {
              parsedConditions = [];
            }
          }

          const res = await createRuleAction({
            workspaceId,
            userId,
            name: item.name,
            product: item.product || null,
            adAccounts: item.adAccounts || [],
            applyTo: item.applyTo || "active_campaigns",
            filterByName: item.filterByName || null,
            action: item.action,
            actionValue: item.actionValue ?? null,
            actionUnit: item.actionUnit ?? null,
            budgetLimit: item.budgetLimit ?? null,
            metricsLevel: item.metricsLevel || "campaign",
            conditions: parsedConditions || [],
            evaluationPeriod: item.evaluationPeriod || "today",
            frequency: item.frequency || "15min",
            executionWindow: item.executionWindow || null,
            dailyLimit: item.dailyLimit ?? null,
          });

          if (res.success) {
            successCount++;
          } else {
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`${successCount} regra(s) importada(s) com sucesso!`);
          await loadRules();
        }

        if (failCount > 0) {
          toast.error(`${failCount} falha(s) na importação.`);
        }
      } catch (err) {
        console.error("Erro ao ler JSON de importação:", err);
        toast.error("Formato de arquivo inválido. Envie um JSON válido.");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.readAsText(file);
  };

  // 📤 EXPORTAR REGRAS PARA ARQUIVO JSON
  const handleExport = () => {
    // Se houver regras selecionadas na tabela, exporta apenas elas. Senão, exporta todas.
    const rulesToExport =
      selectedRuleIds.length > 0
        ? rules.filter((r) => selectedRuleIds.includes(r.id))
        : rules;

    if (rulesToExport.length === 0) {
      toast.error("Nenhuma regra disponível para exportar.");
      return;
    }

    const exportData = rulesToExport.map((rule) => {
      const raw = (rule.rawConfig || {}) as Record<string, unknown>;
      return {
        name: rule.name,
        product: raw.product ?? null,
        adAccounts: raw.adAccounts ?? [],
        applyTo: raw.applyTo ?? "active_campaigns",
        filterByName: raw.filterByName ?? null,
        action: raw.action,
        actionValue: raw.actionValue ?? null,
        actionUnit: raw.actionUnit ?? null,
        budgetLimit: raw.budgetLimit ?? null,
        metricsLevel: raw.metricsLevel ?? "campaign",
        conditions: raw.conditions ?? rule.conditions ?? [],
        evaluationPeriod: raw.evaluationPeriod ?? "today",
        frequency: rule.frequency,
        executionWindow: raw.executionWindow ?? null,
        dailyLimit: raw.dailyLimit ?? null,
      };
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `regras-meta-scale-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${rulesToExport.length} regra(s) exportada(s) com sucesso!`);
  };

  const confirmBulkDelete = () => {
    if (selectedRuleIds.length === 0) {
      toast.error("Nenhuma regra selecionada.");
      return;
    }
    setItemsToDelete(selectedRuleIds);
  };

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch = rule.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [rules, searchTerm]);

  const columns = useMemo(
    () =>
      getColumns({
        onToggleStatus: toggleRuleStatus,
        onEdit: openEditModal,
        onDelete: confirmSingleDelete,
      }),
    [toggleRuleStatus, openEditModal, confirmSingleDelete],
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative">
      <div className="sticky top-0 shrink-0 w-full px-6 pt-6 pb-4 border-b border-border/30 transition-all backdrop-blur-md shadow-sm z-30">
        <MarketingHeader
          user={currentUser}
          showValues={true}
          setShowValues={() => {}}
          isEditing={false}
          setIsEditing={() => {}}
          hideControls={true}
          onSave={() => {}}
          onReset={() => {}}
        />
      </div>

      <div className="flex-1 p-6 min-h-0 w-full flex flex-col transition-all duration-300">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileChange}
        />

        <PremiumCard className="w-full h-full flex flex-col overflow-hidden relative z-0 p-0 shadow-sm rounded-xl">
          <Tabs defaultValue="meta" className="w-full h-full flex flex-col">
            <div className="shrink-0 border-b border-border/40 w-full relative z-10 px-0 bg-transparent">
              <TabsList className="bg-transparent border-none w-full flex justify-start rounded-none p-0 h-auto">
                <TabsTrigger
                  value="meta"
                  className={cn(
                    "relative rounded-none border-b-0 py-4 px-6 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[14px] text-muted-foreground hover:text-foreground",
                    "data-[state=active]:text-foreground",
                    "data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
                    "after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                    "data-[state=active]:after:scale-x-100",
                    "data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
                    "data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.6)]",
                  )}
                >
                  <Facebook size={16} color="#1778F2" /> Meta
                </TabsTrigger>
                <TabsTrigger
                  value="google"
                  className={cn(
                    "relative rounded-none border-b-0 py-4 px-6 font-semibold flex items-center gap-2.5 bg-transparent shadow-none transition-all duration-300 z-10 text-[14px] text-muted-foreground hover:text-foreground",
                    "data-[state=active]:text-foreground",
                    "data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-600/10 data-[state=active]:to-transparent",
                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]",
                    "after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-out",
                    "data-[state=active]:after:scale-x-100",
                    "data-[state=active]:after:bg-blue-600 dark:data-[state=active]:after:bg-blue-500",
                    "data-[state=active]:after:shadow-[0_-2px_15px_1px_rgba(59,130,246,0.6)]",
                  )}
                >
                  <GoogleIcon className="w-4 h-4" /> Google (Beta)
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="meta"
              className="flex-1 flex flex-col min-h-0 m-0 data-[state=inactive]:hidden bg-transparent"
            >
              <div className="shrink-0 border-b border-border/40 w-full p-4 flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      Regras
                    </h2>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={14}
                            className="text-muted-foreground cursor-help hover:text-foreground transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-zinc-950 border-zinc-800 text-white max-w-sm p-3 text-xs shadow-xl"
                        >
                          <p>
                            Atualize campanhas, conjuntos de anúncios ou
                            anúncios em massa automaticamente criando regras
                            automatizadas
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="h-4 w-px bg-border/60" />

                  <div className="relative w-72">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Pesquisar regras..."
                      className="h-9 pl-9 bg-background/50 border-border text-xs focus-visible:ring-1 focus-visible:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 text-xs px-4"
                      >
                        Mais
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-popover border-border text-popover-foreground shadow-md rounded-md"
                    >
                      <DropdownMenuItem
                        onClick={handleImportClick}
                        className="gap-2 cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
                      >
                        <Upload size={14} /> Importar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleExport}
                        className="gap-2 cursor-pointer text-xs focus:bg-accent focus:text-accent-foreground"
                      >
                        <Download size={14} /> Exportar Meta
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={confirmBulkDelete}
                        className="gap-2 cursor-pointer text-xs text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-700 dark:focus:text-red-400"
                      >
                        <Trash size={14} /> Excluir selecionadas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            size="sm"
                            onClick={openCreateModal}
                            disabled={isLimitReached}
                            className="group/btn relative overflow-hidden px-5 w-36 h-9 rounded-md text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-80 cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-0 group-hover/btn:duration-[1200ms] ease-out" />
                            <Plus size={14} /> Criar regra
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {isLimitReached && (
                        <TooltipContent
                          side="bottom"
                          className="bg-zinc-900 border-zinc-800 text-white text-xs p-2"
                        >
                          {maxRules === 0
                            ? "Seu plano atual (START) não possui regras automatizadas. Faça upgrade para utilizar."
                            : `Você atingiu o limite de ${maxRules} regras do plano ${currentUser.plan}.`}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <RulesTable
                columns={columns}
                data={filteredRules}
                onRowSelectionChange={(selectedRows) =>
                  setSelectedRuleIds(selectedRows.map((r) => r.id))
                }
              />
            </TabsContent>

            <TabsContent
              value="google"
              className="flex-1 flex flex-col items-center justify-center min-h-0 m-0 data-[state=inactive]:hidden bg-transparent"
            >
              <div className="text-center space-y-3 p-10">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto border border-border">
                  <GoogleIcon className="w-8 h-8 opacity-50 grayscale" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Regras para Google Ads
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Esta funcionalidade está em desenvolvimento e estará
                  disponível em breve para automatizar suas campanhas de Search
                  e Youtube.
                </p>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-500/20">
                  EM BREVE
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </PremiumCard>
      </div>

      <CreateRuleModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleSaveRule}
        initialData={
          ruleToEdit?.rawConfig as React.ComponentProps<
            typeof CreateRuleModal
          >["initialData"]
        }
        workspaceId={workspaceId}
        userId={userId}
      />

      <AlertDialog
        open={itemsToDelete.length > 0}
        onOpenChange={(open) => !open && setItemsToDelete([])}
      >
        <AlertDialogContent className="bg-popover border-border text-popover-foreground rounded-lg shadow-lg max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-foreground">
              Você tem certeza absoluta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              {itemsToDelete.length > 1
                ? `Isso excluirá permanentemente ${itemsToDelete.length} regras. `
                : "Isso excluirá permanentemente esta regra. "}
              As automações pararão de funcionar imediatamente. Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md px-4 py-2 text-sm font-medium transition-colors">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm"
            >
              Sim, excluir {itemsToDelete.length > 1 ? "regras" : "regra"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
