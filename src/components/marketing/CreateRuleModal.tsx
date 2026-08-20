"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, X, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createRuleAction, getWorkspaceOptionsAction } from "@/actions/rules";

export const OPERATOR_OPTIONS = [
  { label: "Maior que (>)", value: ">" },
  { label: "Menor que (<)", value: "<" },
  { label: "Maior ou igual (≥)", value: ">=" },
  { label: "Menor ou igual (≤)", value: "<=" },
];

export interface ConditionData {
  metric: string;
  operator: string;
  value: string | number;
}

export interface RuleData {
  id?: string;
  name?: string;
  product?: string;
  adAccounts?: string[];
  account?: string;
  scope?: string;
  applyTo?: string;
  nameFilterType?: string;
  nameFilterOperator?: string;
  nameFilterValue?: string;
  action?: string;
  actionValue?: string | number | null;
  actionUnit?: string | null;
  conditionLevel?: string;
  metricsLevel?: string;
  conditions?: ConditionData[];
  period?: string;
  evaluationPeriod?: string;
  frequency?: string;
  dailyLimit?: string;
  executionInterval?: string;
  executionWindow?: string | null;
  budgetLimit?: number | null;
}

interface CreateRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  userId: string;
  onSave?: (ruleData: RuleData) => void;
  initialData?: RuleData;
}

const METRIC_TYPES: Record<
  string,
  "currency" | "percent" | "number" | "integer"
> = {
  spent: "currency",
  cpa: "currency",
  cpc: "currency",
  budget: "currency",
  cpi: "currency",
  cost_per_convo: "currency",
  cpl: "currency",
  cpv: "currency",
  cpm: "currency",
  profit: "currency",
  margin: "percent",
  ctr: "percent",
  roi: "number",
  roas: "number",
  purchases: "integer",
  ics: "integer",
  clicks: "integer",
  conversations: "integer",
  page_views: "integer",
};

const METRIC_OPTIONS = [
  { value: "spent", label: "Gasto" },
  { value: "cpa", label: "CPA" },
  { value: "roi", label: "ROI" },
  { value: "roas", label: "ROAS" },
  { value: "profit", label: "Lucro" },
  { value: "margin", label: "Margem de Lucro" },
  { value: "cpc", label: "CPC" },
  { value: "budget", label: "Orçamento" },
  { value: "purchases", label: "Vendas" },
  { value: "ics", label: "ICs" },
  { value: "ctr", label: "CTR" },
  { value: "cpm", label: "CPM" },
  { value: "clicks", label: "Cliques" },
];

const SCROLLABLE_SELECT_CONTENT =
  "bg-zinc-900 border-zinc-800 text-zinc-300 max-h-[200px] overflow-y-auto custom-scrollbar";

const LabelWithTooltip = ({
  label,
  tooltipText,
}: {
  label: string;
  tooltipText?: string;
}) => (
  <div className="flex items-center gap-1.5 mb-2">
    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </Label>
    {tooltipText && (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              size={12}
              className="text-muted-foreground/70 cursor-help hover:text-foreground transition-colors"
            />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-popover border-border text-popover-foreground text-xs max-w-[200px]"
          >
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return `${h}:00`;
});

export function CreateRuleModal({
  open,
  onOpenChange,
  workspaceId,
  userId,
  onSave,
  initialData,
}: CreateRuleModalProps) {
  const [isPending, startTransition] = useTransition();
  const isSubmittingRef = useRef(false); // 🔒 Trava síncrona
  const [isSubmitting, setIsSubmitting] = useState(false); // Trava extra de envio

  // DADOS DINÂMICOS DO BANCO DE DADOS
  const [dbProducts, setDbProducts] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [dbAdAccounts, setDbAdAccounts] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // ESTADOS DO FORMULÁRIO
  const [name, setName] = useState("");
  const [product, setProduct] = useState("qualquer");
  const [account, setAccount] = useState("todas");
  const [scope, setScope] = useState("active_campaigns");

  const [nameFilterType, setNameFilterType] = useState("any");
  const [nameFilterOperator, setNameFilterOperator] = useState("contains");
  const [nameFilterValue, setNameFilterValue] = useState("");

  const [action, setAction] = useState("pause");
  const [conditionLevel, setConditionLevel] = useState("object");
  const [conditions, setConditions] = useState<
    { metric: string; operator: string; value: string }[]
  >([]);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [actionValue, setActionValue] = useState("");
  const [actionUnit, setActionUnit] = useState("percentage");

  const [period, setPeriod] = useState("today");
  const [frequency, setFrequency] = useState("15min");

  const [executionIntervalType, setExecutionIntervalType] = useState("any");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");

  const [dailyLimit, setDailyLimit] = useState("no_limit");

  // BUSCA PRODUTOS E CONTAS DE ANÚNCIO VINCULADOS AO WORKSPACE
  useEffect(() => {
    async function loadWorkspaceOptions() {
      if (!open || !workspaceId) return;
      setIsLoadingOptions(true);
      try {
        const res = await getWorkspaceOptionsAction(workspaceId);
        if (res.success) {
          setDbProducts(res.products || []);
          setDbAdAccounts(res.adAccounts || []);
        }
      } catch (error) {
        console.error("Erro ao carregar opções do workspace:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    }

    loadWorkspaceOptions();
  }, [open, workspaceId]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setProduct(initialData.product || "qualquer");
        setAccount(
          Array.isArray(initialData.adAccounts) &&
            initialData.adAccounts.length > 0
            ? initialData.adAccounts[0]
            : initialData.account || "todas",
        );
        setScope(
          initialData.scope || initialData.applyTo || "active_campaigns",
        );
        setNameFilterType(initialData.nameFilterType || "any");
        setNameFilterOperator(initialData.nameFilterOperator || "contains");
        setNameFilterValue(initialData.nameFilterValue || "");

        setAction(initialData.action || "pause");
        setActionValue(
          initialData.actionValue !== undefined &&
            initialData.actionValue !== null
            ? String(initialData.actionValue)
            : "",
        );
        setActionUnit(initialData.actionUnit || "percentage");

        setConditionLevel(
          initialData.conditionLevel || initialData.metricsLevel || "object",
        );

        // 🟢 CORREÇÃO DAS CONDIÇÕES: Trata tanto String JSON quanto Array
        let parsedConditions: ConditionData[] = [];
        if (typeof initialData.conditions === "string") {
          try {
            parsedConditions = JSON.parse(initialData.conditions);
          } catch (error) {
            console.error("Erro ao converter JSON de condições:", error);
            parsedConditions = [];
          }
        } else if (Array.isArray(initialData.conditions)) {
          parsedConditions = initialData.conditions;
        }

        setConditions(
          parsedConditions.map((c: ConditionData) => ({
            metric: c.metric || "spent",
            operator: c.operator || "greater_than",
            value: String(c.value ?? ""),
          })),
        );

        setPeriod(
          initialData.period || initialData.evaluationPeriod || "today",
        );
        setFrequency(initialData.frequency || "15min");

        // 🟢 CORREÇÃO DO LIMITE DIÁRIO: Carrega números ou 'no_limit'
        if (
          initialData.dailyLimit !== null &&
          initialData.dailyLimit !== undefined &&
          initialData.dailyLimit !== ""
        ) {
          setDailyLimit(String(initialData.dailyLimit));
        } else {
          setDailyLimit("no_limit");
        }

        // 🟢 CORREÇÃO DO INTERVALO DE EXECUÇÃO (Suporta 'executionWindow' e 'executionInterval')
        const windowVal =
          initialData.executionWindow || initialData.executionInterval;

        if (typeof windowVal === "string" && windowVal.includes("-")) {
          setExecutionIntervalType("custom");
          const [s, e] = windowVal.split("-");
          setStartTime(s || "00:00");
          setEndTime(e || "00:00");
        } else {
          setExecutionIntervalType(windowVal || "any");
          setStartTime("00:00");
          setEndTime("00:00");
        }
      } else {
        // ➕ RESETA PARA OS VALORES PADRÃO AO CRIAR NOVA REGRA
        setName("");
        setProduct("qualquer");
        setAccount("todas");
        setScope("active_campaigns");
        setNameFilterType("any");
        setNameFilterOperator("contains");
        setNameFilterValue("");

        setAction("pause");
        setActionValue("");
        setActionUnit("percentage");

        setConditionLevel("object");
        setConditions([]);
        setPeriod("today");
        setFrequency("15min");
        setExecutionIntervalType("any");
        setStartTime("00:00");
        setEndTime("00:00");
        setDailyLimit("no_limit");
      }
    }
  }, [open, initialData]);

  // ==========================================
  // 🟢 GERENCIAMENTO DE CONDIÇÕES (SE)
  // ==========================================

  /** Adiciona uma nova linha de condição no formulário */
  const addCondition = () => {
    setConditions([
      ...conditions,
      { metric: "spent", operator: ">", value: "" },
    ]);
  };

  /** Remove uma linha de condição pelo seu índice */
  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  /** Atualiza um campo específico (métrica, operador ou valor) de uma condição */
  const updateCondition = (
    index: number,
    field: keyof ConditionData,
    value: string,
  ) => {
    const newConditions = [...conditions];

    // Atualiza o valor do campo selecionado
    newConditions[index] = { ...newConditions[index], [field]: value };

    // Se o usuário trocar a métrica, reseta o valor digitado para evitar inconsistência
    if (field === "metric") {
      newConditions[index] = { ...newConditions[index], value: "" };
    }

    setConditions(newConditions);
  };

  // FUNÇÃO DE MÁSCARA AUTOMÁTICA (Para % e R$)
  const handleFormatValue = (
    val: string,
    type: "percentage" | "fixed" | "absolute",
    setter: (v: string) => void,
  ) => {
    const digits = val.replace(/\D/g, ""); // Remove tudo que não for número
    if (!digits) {
      setter("");
      return;
    }

    if (type === "percentage") {
      setter(`${digits}%`);
    } else {
      const floatValue = parseInt(digits, 10) / 100;
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(floatValue);
      setter(formatted);
    }
  };

  const handleSave = () => {
    // 1. Evita envio duplo instantaneamente com o useRef
    if (isSubmittingRef.current || isSubmitting || isPending) return;

    if (!name.trim()) {
      toast.error("Por favor, dê um nome para a regra.");
      return;
    }

    if (conditions.length === 0) {
      toast.error("Adicione pelo menos 1 condição para aplicar a regra.");
      return;
    }

    const hasEmptyCondition = conditions.some(
      (c) => !String(c.value ?? "").trim(),
    );
    if (hasEmptyCondition) {
      toast.error("Preencha o valor de todas as condições adicionadas.");
      return;
    }

    if (executionIntervalType === "custom" && startTime === endTime) {
      toast.error(
        "Os horários de execução inicial e final não podem ser iguais.",
      );
      return;
    }

    // Validação extra para Ação Condicional
    const requiresActionValue = [
      "increase_budget",
      "decrease_budget",
      "set_budget",
    ].includes(action);
    if (requiresActionValue && !actionValue) {
      toast.error("Por favor, preencha o valor da ação de orçamento.");
      return;
    }

    const formattedConditions = conditions.map((c) => {
      const rawValue = String(c.value ?? "").replace(",", ".");
      return {
        metric: c.metric,
        operator: c.operator,
        value: parseFloat(rawValue) || 0,
      };
    });

    // 2. ATIVA A TRAVA SÍNCRONA IMEDIATAMENTE NA MEMÓRIA
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const parseFormattedValue = (strValue: string | number, type: string) => {
      const str = String(strValue).replace(/\D/g, "");
      if (!str) return 0;
      if (type === "percentage") return parseFloat(str);
      return parseFloat(str) / 100; // Divide por 100 se for moeda
    };

    startTransition(async () => {
      try {
        const response = await createRuleAction({
          id: initialData?.id,
          workspaceId,
          userId,
          name,
          product,
          adAccounts: [account],
          applyTo: scope,
          action,
          actionValue: requiresActionValue
            ? parseFormattedValue(actionValue, actionUnit)
            : null,
          actionUnit: requiresActionValue ? actionUnit : null,
          budgetLimit:
            (action === "increase_budget" || action === "decrease_budget") &&
            budgetLimit
              ? parseFormattedValue(budgetLimit, "fixed")
              : null,
          metricsLevel: conditionLevel,
          conditions: formattedConditions,
          evaluationPeriod: period,
          frequency,

          executionWindow:
            executionIntervalType === "custom"
              ? `${startTime}-${endTime}`
              : executionIntervalType,
          dailyLimit: dailyLimit === "no_limit" ? null : dailyLimit,
        });

        if (response.success) {
          toast.success(
            initialData
              ? "Regra atualizada com sucesso!"
              : "Regra criada com sucesso!",
          );
          if (onSave && response.rule) {
            onSave(response.rule as unknown as RuleData);
          }
          onOpenChange(false);
        } else {
          toast.error(response.error || "Erro ao salvar a regra.");
        }
      } catch (error) {
        toast.error("Ocorreu um erro inesperado ao salvar.");
      } finally {
        // 3. Libera as travas no final de tudo
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    });
  };

  const renderValueInput = (cond: ConditionData, index: number) => {
    const type = METRIC_TYPES[cond.metric] || "number";
    return (
      <div className="relative w-full">
        {type === "currency" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            R$
          </div>
        )}
        <Input
          type="number"
          placeholder={type === "currency" ? "0,00" : "0"}
          className={cn(
            "h-10 text-sm bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/50",
            type === "currency" ? "pl-10" : "",
            type === "percent" ? "pr-8" : "",
          )}
          value={cond.value}
          onChange={(e) => updateCondition(index, "value", e.target.value)}
        />
        {type === "percent" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            %
          </div>
        )}
      </div>
    );
  };

  const inputContainerClass =
    "bg-background border border-border rounded-md focus-within:ring-1 focus-within:ring-primary/50 transition-all";
  const selectTriggerClass =
    "h-10 w-full bg-transparent border-none text-sm focus:ring-0 shadow-none px-3";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-transparent border-none shadow-2xl">
        <div
          className={cn(
            "relative group rounded-xl p-[1px] shadow-sm transition-all",
            "bg-gradient-to-b from-gray-200 via-gray-100 to-transparent",
            "dark:from-white/20 dark:via-white/10 dark:to-transparent",
          )}
        >
          <div
            className={cn(
              "relative h-full w-full rounded-xl overflow-hidden flex flex-col max-h-[85vh]",
              "bg-background bg-gradient-to-br from-gray-50/50 to-transparent",
              "dark:bg-zinc-950 dark:from-zinc-900/50 dark:to-black",
            )}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-30 dark:via-white/10 pointer-events-none z-20" />

            <DialogHeader className="px-6 py-5 border-b border-border/40 shrink-0 relative z-10 bg-background/50 backdrop-blur-sm">
              <DialogTitle className="text-base font-semibold text-foreground">
                {initialData ? "Editar regra" : "Criar regra personalizada"}
              </DialogTitle>
              <p className="text-[13px] text-muted-foreground mt-1">
                Configure automações para suas campanhas.
              </p>
            </DialogHeader>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar relative z-10">
              {/* NOME */}
              <div>
                <LabelWithTooltip label="Nome da regra" />
                <Input
                  placeholder="Ex: Pausar campanhas ruins"
                  className="bg-background border-border h-10 focus-visible:ring-primary/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* PRODUTO / CONTA (INTEGRADOS AO BANCO) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <LabelWithTooltip label="Produto" />
                  <div className={inputContainerClass}>
                    <Select
                      value={product}
                      onValueChange={setProduct}
                      disabled={isLoadingOptions}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="qualquer">Qualquer</SelectItem>
                        {dbProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <LabelWithTooltip label="Contas de Anúncio" />
                  <div className={inputContainerClass}>
                    <Select
                      value={account}
                      onValueChange={setAccount}
                      disabled={isLoadingOptions}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="todas">Todas</SelectItem>
                        {dbAdAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* APLICAR A */}
              <div>
                <LabelWithTooltip label="Aplicar regra a" />
                <div className={inputContainerClass}>
                  <Select value={scope} onValueChange={setScope}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                      <SelectItem value="active_campaigns">
                        Campanhas Ativas
                      </SelectItem>
                      <SelectItem value="paused_campaigns">
                        Campanhas Pausadas
                      </SelectItem>
                      <SelectItem value="active_adsets">
                        Conjuntos Ativos
                      </SelectItem>
                      <SelectItem value="active_ads">
                        Anúncios Ativos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FILTRAR POR NOME */}
              <div>
                <LabelWithTooltip
                  label="Filtrar por nome"
                  tooltipText="Filtra quais itens receberão a regra."
                />
                <div className="space-y-2">
                  <div className={inputContainerClass}>
                    <Select
                      value={nameFilterType}
                      onValueChange={setNameFilterType}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="any">Qualquer</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {nameFilterType === "custom" && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className={cn(inputContainerClass, "w-1/3")}>
                        <Select
                          value={nameFilterOperator}
                          onValueChange={setNameFilterOperator}
                        >
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                            <SelectItem value="contains">Contém</SelectItem>
                            <SelectItem value="not_contains">
                              Não contém
                            </SelectItem>
                            <SelectItem value="equals">É igual a</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Texto para filtrar..."
                        className="flex-1 bg-background border-border h-10 focus-visible:ring-primary/50"
                        value={nameFilterValue}
                        onChange={(e) => setNameFilterValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* AÇÃO */}
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  {/* BLOCO 1: SELETOR DE AÇÃO */}
                  <div
                    className={cn(
                      "flex-[1.5]",
                      action === "increase_budget" ||
                        action === "decrease_budget"
                        ? ""
                        : "flex-none w-full",
                    )}
                  >
                    <LabelWithTooltip label="Ação" />
                    <div
                      className={cn(
                        inputContainerClass,
                        "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
                      )}
                    >
                      <Select
                        value={action}
                        onValueChange={(val) => {
                          setAction(val);
                          setActionValue("");
                          setActionUnit(
                            val === "set_budget" ? "absolute" : "percentage",
                          );
                          setBudgetLimit(""); // Reseta o limite
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            selectTriggerClass,
                            "text-blue-500 dark:text-blue-400 font-medium",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                          <SelectItem value="activate">Ativar</SelectItem>
                          <SelectItem value="pause">Pausar</SelectItem>
                          <SelectItem value="increase_budget">
                            Aumentar orçamento
                          </SelectItem>
                          <SelectItem value="decrease_budget">
                            Diminuir orçamento
                          </SelectItem>
                          <SelectItem value="set_budget">
                            Definir orçamento
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* BLOCO 2: INPUT E TIPO MESCLADOS (Apenas para Aumentar/Diminuir) */}
                  {(action === "increase_budget" ||
                    action === "decrease_budget") && (
                    <div className="flex-1 animate-in fade-in slide-in-from-right-2 duration-200">
                      <Label className="text-[10px] text-muted-foreground uppercase mb-1.5 block">
                        {actionUnit === "percentage"
                          ? "Porcentagem"
                          : "Valor fixo"}
                      </Label>
                      <div className="flex items-center border border-border rounded-md bg-background focus-within:ring-1 focus-within:ring-primary/50 overflow-hidden h-10 transition-shadow">
                        <Input
                          type="text"
                          placeholder={
                            actionUnit === "percentage" ? "0%" : "R$ 0,00"
                          }
                          className="border-none shadow-none focus-visible:ring-0 h-full flex-1 rounded-none px-3"
                          value={actionValue}
                          onChange={(e) =>
                            handleFormatValue(
                              e.target.value,
                              actionUnit as "percentage" | "fixed",
                              setActionValue,
                            )
                          }
                        />
                        <div className="w-[1px] h-6 bg-border mx-1" />
                        <Select
                          value={actionUnit}
                          onValueChange={(val) => {
                            setActionUnit(val);
                            setActionValue("");
                          }}
                        >
                          <SelectTrigger className="border-none shadow-none focus-visible:ring-0 w-[70px] h-full rounded-none bg-transparent">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">R$</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCO 3: LIMITE DE ORÇAMENTO (Linha de baixo) */}
                {(action === "increase_budget" ||
                  action === "decrease_budget") && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <LabelWithTooltip
                      label={
                        action === "increase_budget"
                          ? "Limite máximo de orçamento"
                          : "Limite mínimo de orçamento"
                      }
                      tooltipText={`Este é o valor ${action === "increase_budget" ? "máximo" : "mínimo"} que o seu orçamento pode atingir por meio das regras. Se o valor for zero, o orçamento não terá limite.`}
                    />
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      className="bg-background border-border h-10 focus-visible:ring-primary/50"
                      value={budgetLimit}
                      onChange={(e) =>
                        handleFormatValue(
                          e.target.value,
                          "fixed",
                          setBudgetLimit,
                        )
                      }
                    />
                  </div>
                )}

                {/* BLOCO 4: DEFINIR ORÇAMENTO (Ação: set_budget) */}
                {action === "set_budget" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground uppercase mb-1.5 block">
                          Valor a definir
                        </Label>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          className="bg-background border-border h-10 focus-visible:ring-primary/50"
                          value={actionValue}
                          onChange={(e) =>
                            handleFormatValue(
                              e.target.value,
                              "fixed",
                              setActionValue,
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground uppercase mb-1.5 block">
                          Tipo
                        </Label>
                        <div className={inputContainerClass}>
                          <Select
                            value={actionUnit}
                            onValueChange={setActionUnit}
                          >
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                              className={SCROLLABLE_SELECT_CONTENT}
                            >
                              <SelectItem value="absolute">Absoluto</SelectItem>
                              <SelectItem value="spent_amount">
                                Valor gasto
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-md text-sm border border-red-500/20">
                      <p className="font-bold mb-1">Atenção!</p>
                      <p className="text-xs leading-relaxed">
                        É necessário respeitar os limites mínimo e máximo
                        impostos pela plataforma de anúncios...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* NÍVEL DAS CONDIÇÕES */}
              <div>
                <LabelWithTooltip
                  label="Nível das Condições"
                  tooltipText="Nível dos dados analisados."
                />
                <div className={inputContainerClass}>
                  <Select
                    value={conditionLevel}
                    onValueChange={setConditionLevel}
                  >
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                      <SelectItem value="object">
                        Nível do Objeto (campanha/conjunto/anúncio)
                      </SelectItem>
                      <SelectItem value="adset">Nível do Conjunto</SelectItem>
                      <SelectItem value="ad">Nível do Anúncio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CONDIÇÕES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <LabelWithTooltip
                    label="Condições"
                    tooltipText="A regra só executa se TODAS as condições forem verdadeiras."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addCondition}
                    className="text-xs text-primary hover:bg-primary/10 h-6 px-2"
                  >
                    <Plus size={12} className="mr-1" /> Adicionar
                  </Button>
                </div>
                {conditions.map((cond, index) => (
                  <div
                    key={index}
                    className="relative space-y-2 bg-muted/30 p-3 rounded-lg border border-border group hover:border-primary/30 transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2.5 -right-2.5 h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => removeCondition(index)}
                    >
                      <X size={14} />
                    </Button>
                    <div className="grid grid-cols-1 gap-2">
                      <div className={inputContainerClass}>
                        <Select
                          value={cond.metric}
                          onValueChange={(val) =>
                            updateCondition(index, "metric", val)
                          }
                        >
                          <SelectTrigger
                            className={cn(selectTriggerClass, "h-9")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                            {METRIC_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className={inputContainerClass}>
                        <Select
                          value={cond.operator}
                          onValueChange={(val) =>
                            updateCondition(index, "operator", val)
                          }
                        >
                          <SelectTrigger
                            className={cn(selectTriggerClass, "h-9")}
                          >
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                            {OPERATOR_OPTIONS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>{renderValueInput(cond, index)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40" />

              {/* PERÍODO E FREQUÊNCIA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <LabelWithTooltip
                    label="Período de Cálculo"
                    tooltipText="Janela de tempo dos dados analisados."
                  />
                  <div className={inputContainerClass}>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="maximum">Máximo</SelectItem>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="yesterday">Ontem</SelectItem>
                        <SelectItem value="last_2_days_inc">
                          Últimos 2 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_3_days_inc">
                          Últimos 3 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_4_days_inc">
                          Últimos 4 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_5_days_inc">
                          Últimos 5 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_6_days_inc">
                          Últimos 6 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_7_days_inc">
                          Últimos 7 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_14_days_inc">
                          Últimos 14 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_30_days_inc">
                          Últimos 30 dias, incluindo hoje
                        </SelectItem>
                        <SelectItem value="last_2_days_exc">
                          Últimos 2 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_3_days_exc">
                          Últimos 3 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_4_days_exc">
                          Últimos 4 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_5_days_exc">
                          Últimos 5 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_6_days_exc">
                          Últimos 6 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_7_days_exc">
                          Últimos 7 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_14_days_exc">
                          Últimos 14 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="last_30_days_exc">
                          Últimos 30 dias, excluindo hoje
                        </SelectItem>
                        <SelectItem value="lifetime">Vitalício</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <LabelWithTooltip
                    label="Frequência"
                    tooltipText="Frequência da execução da regra."
                  />
                  <div className={inputContainerClass}>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="10min">A cada 10 minutos</SelectItem>
                        <SelectItem value="15min">A cada 15 minutos</SelectItem>
                        <SelectItem value="30min">A cada 30 minutos</SelectItem>
                        <SelectItem value="1hour">A cada hora</SelectItem>
                        <SelectItem value="2hours">A cada 2 horas</SelectItem>
                        <SelectItem value="3hours">A cada 3 horas</SelectItem>
                        <SelectItem value="6hours">A cada 6 horas</SelectItem>
                        <SelectItem value="12hours">A cada 12 horas</SelectItem>
                        <SelectItem value="daily">Uma vez por dia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* INTERVALO E LIMITE */}
              <div className="space-y-4 pt-2">
                <div>
                  <LabelWithTooltip
                    label="Intervalo de Execução"
                    tooltipText="Define a janela de horário permitida."
                  />
                  <div className={inputContainerClass}>
                    <Select
                      value={executionIntervalType}
                      onValueChange={setExecutionIntervalType}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="any">Qualquer</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {executionIntervalType === "custom" && (
                    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">
                            Horário inicial
                          </Label>
                          <div className={inputContainerClass}>
                            <Select
                              value={startTime}
                              onValueChange={setStartTime}
                            >
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                className={SCROLLABLE_SELECT_CONTENT}
                              >
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">
                            Horário final
                          </Label>
                          <div className={inputContainerClass}>
                            <Select value={endTime} onValueChange={setEndTime}>
                              <SelectTrigger className={selectTriggerClass}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                className={SCROLLABLE_SELECT_CONTENT}
                              >
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {startTime === endTime && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-xs text-red-500 leading-relaxed">
                          <strong>Atenção!</strong>
                          <br />
                          Os horários de execução selecionados são iguais. Por
                          favor, selecione horários diferentes para garantir que
                          a regra seja aplicada corretamente.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <LabelWithTooltip
                    label="Limite de Execuções Diária"
                    tooltipText="Máximo de execuções por dia."
                  />
                  <div className={inputContainerClass}>
                    <Select value={dailyLimit} onValueChange={setDailyLimit}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="no_limit">Sem Limite</SelectItem>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {num === 1 ? "vez" : "vezes"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border/40 shrink-0 bg-background/50 backdrop-blur-sm flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting || isPending}
                className="group/btn relative overflow-hidden px-5 w-32 h-9 rounded-md text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-80 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-0 group-hover/btn:duration-[1200ms] ease-out" />
                {(isSubmitting || isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting || isPending
                  ? "Salvando..."
                  : initialData
                    ? "Salvar alterações"
                    : "Criar regra"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
