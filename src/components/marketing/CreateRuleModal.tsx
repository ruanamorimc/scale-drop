"use client";

import React, { useState, useEffect } from "react";
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
import { Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ruleData: any) => void;
  initialData?: any; // 🔥 Adicionado para receber dados da regra sendo editada
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
  onSave,
  initialData,
}: CreateRuleModalProps) {
  // ESTADOS
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

  const [period, setPeriod] = useState("today");
  const [frequency, setFrequency] = useState("15min");

  const [executionIntervalType, setExecutionIntervalType] = useState("any");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");

  const [dailyLimit, setDailyLimit] = useState("no_limit");

  // 🔥 EFEITO PARA CARREGAR OS DADOS AO EDITAR
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setProduct(initialData.product || "qualquer");
        setAccount(initialData.account || "todas");
        setScope(initialData.scope || "active_campaigns");
        setNameFilterType(initialData.nameFilterType || "any");
        setNameFilterOperator(initialData.nameFilterOperator || "contains");
        setNameFilterValue(initialData.nameFilterValue || "");
        setAction(initialData.action || "pause");
        setConditionLevel(initialData.conditionLevel || "object");
        setConditions(
          initialData.conditions ? [...initialData.conditions] : [],
        );
        setPeriod(initialData.period || "today");
        setFrequency(initialData.frequency || "15min");
        setDailyLimit(initialData.dailyLimit || "no_limit");

        // Tratar o intervalo de tempo
        if (
          initialData.executionInterval &&
          initialData.executionInterval.includes("-")
        ) {
          setExecutionIntervalType("custom");
          const [s, e] = initialData.executionInterval.split("-");
          setStartTime(s || "00:00");
          setEndTime(e || "00:00");
        } else {
          setExecutionIntervalType(initialData.executionInterval || "any");
          setStartTime("00:00");
          setEndTime("00:00");
        }
      } else {
        // Modo Criação: Reseta tudo
        setName("");
        setProduct("qualquer");
        setAccount("todas");
        setScope("active_campaigns");
        setNameFilterType("any");
        setNameFilterOperator("contains");
        setNameFilterValue("");
        setAction("pause");
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

  const addCondition = () => {
    setConditions([
      ...conditions,
      { metric: "spent", operator: "greater_than", value: "" },
    ]);
  };

  const removeCondition = (index: number) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...conditions];
    (newConditions[index] as any)[field] = value;
    if (field === "metric") {
      (newConditions[index] as any).value = "";
    }
    setConditions(newConditions);
  };

  const handleSave = () => {
    // 🔥 VALIDAÇÕES
    if (!name.trim()) {
      toast.error("Por favor, dê um nome para a regra.");
      return;
    }

    if (conditions.length === 0) {
      toast.error("Adicione pelo menos 1 condição para aplicar a regra.");
      return;
    }

    const hasEmptyCondition = conditions.some((c) => !c.value.trim());
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

    onSave({
      name,
      product,
      account,
      scope,
      nameFilterType,
      nameFilterOperator,
      nameFilterValue,
      action,
      conditionLevel,
      conditions,
      period,
      frequency,
      executionInterval:
        executionIntervalType === "custom"
          ? `${startTime}-${endTime}`
          : executionIntervalType,
      dailyLimit,
      status: initialData?.status ?? true, // Mantém o status original
    });

    onOpenChange(false);
  };

  const renderValueInput = (cond: any, index: number) => {
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

              {/* PRODUTO / CONTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <LabelWithTooltip label="Produto" />
                  <div className={inputContainerClass}>
                    <Select value={product} onValueChange={setProduct}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="qualquer">Qualquer</SelectItem>
                        <SelectItem value="produto_a">Produto A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <LabelWithTooltip label="Contas de Anúncio" />
                  <div className={inputContainerClass}>
                    <Select value={account} onValueChange={setAccount}>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="conta_1">Conta 01</SelectItem>
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
              <div>
                <LabelWithTooltip label="Ação" />
                <div
                  className={cn(
                    inputContainerClass,
                    "border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10",
                  )}
                >
                  <Select value={action} onValueChange={setAction}>
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
                    </SelectContent>
                  </Select>
                </div>
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
                      className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
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
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={SCROLLABLE_SELECT_CONTENT}>
                            <SelectItem value="greater_than">
                              Maior que
                            </SelectItem>
                            <SelectItem value="less_than">Menor que</SelectItem>
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
                              {num}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t border-border/40 bg-background/50 backdrop-blur-sm shrink-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-transparent border-border hover:bg-muted text-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
              >
                Salvar
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
