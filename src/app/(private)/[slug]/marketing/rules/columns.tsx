"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AutomationRule } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// 1. Tradução e formatação completa das métricas e operadores
export function formatCondition(
  metric: string,
  operator: string,
  value: number | string,
) {
  const numValue = Number(value) || 0;

  const operatorMap: Record<string, string> = {
    ">": ">",
    "<": "<",
    ">=": "≥",
    "<=": "≤",
    "=": "=",
    greater_than: ">",
    less_than: "<",
    greater_or_equal: "≥",
    less_or_equal: "≤",
    equal: "=",
  };

  const opText = operatorMap[operator] || operator;
  const key = (metric || "")
    .toString()
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "_");

  switch (key) {
    case "SPENT":
    case "GASTO":
      return `Gasto ${opText} R$ ${numValue.toFixed(2)}`;
    case "CPA":
      return `CPA ${opText} R$ ${numValue.toFixed(2)}`;
    case "PROFIT":
    case "LUCRO":
      return `Lucro ${opText} R$ ${numValue.toFixed(2)}`;
    case "CPC":
      return `CPC ${opText} R$ ${numValue.toFixed(2)}`;
    case "BUDGET":
    case "ORCAMENTO":
    case "ORÇAMENTO":
      return `Orçamento ${opText} R$ ${numValue.toFixed(2)}`;
    case "CPM":
      return `CPM ${opText} R$ ${numValue.toFixed(2)}`;
    case "PURCHASES":
    case "VENDAS":
    case "COMPRAS":
      return `Vendas ${opText} ${numValue}`;
    case "ICS":
    case "INITIATE_CHECKOUT":
    case "CHECKOUTS":
      return `ICs ${opText} ${numValue}`;
    case "CLICKS":
    case "CLIQUES":
      return `Cliques ${opText} ${numValue}`;
    case "PROFIT_MARGIN":
    case "MARGEM_DE_LUCRO":
      return `Margem de Lucro ${opText} ${numValue}%`;
    case "CTR":
      return `CTR ${opText} ${numValue}%`;
    case "ROI":
      return `ROI ${opText} ${numValue}x`;
    case "ROAS":
      return `ROAS ${opText} ${numValue}x`;
    default:
      return `${metric} ${opText} ${numValue}`;
  }
}

// 2. Tradução das Ações + Exibição do Valor
export function formatActionLabel(
  action: string,
  actionValue?: number | string | null,
  actionUnit?: string | null,
) {
  const formattedVal = actionValue
    ? actionUnit === "percentage"
      ? `${actionValue}%`
      : `R$ ${actionValue}`
    : "";

  switch (action) {
    case "pause":
      return "Pausar";
    case "start":
    case "enable":
      return "Ativar";
    case "increase_budget":
      return `Aumentar Orçamento ${formattedVal ? `(${formattedVal})` : ""}`;
    case "decrease_budget":
      return `Diminuir Orçamento ${formattedVal ? `(${formattedVal})` : ""}`;
    case "set_budget":
      return `Definir Orçamento ${formattedVal ? `(para ${formattedVal})` : ""}`;
    default:
      return action;
  }
}

// 3. Tradução do Período e Frequência
export function formatFrequencyLabel(freq: string) {
  const map: Record<string, string> = {
    "15min": "A cada 15 min",
    "30min": "A cada 30 min",
    "1hour": "A cada 1 hora",
    "2hours": "A cada 2 horas",
  };
  return map[freq] || freq;
}

export function formatPeriodLabel(period: string) {
  const map: Record<string, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    last_3_days: "Últimos 3 dias",
    last_7_days: "Últimos 7 dias",
  };
  return map[period] || period;
}

interface ConditionItem {
  metric: string;
  operator: string;
  value: number | string;
}

function renderConditions(conditions: unknown) {
  if (!conditions) return "-";

  let items: ConditionItem[] = [];

  if (Array.isArray(conditions)) {
    items = conditions as ConditionItem[];
  } else if (typeof conditions === "string") {
    try {
      const parsed = JSON.parse(conditions);
      if (Array.isArray(parsed)) {
        items = parsed;
      } else {
        return conditions;
      }
    } catch {
      return conditions;
    }
  }

  if (items.length > 0) {
    return items
      .map((c) => formatCondition(c.metric, c.operator, c.value))
      .join(" E ");
  }

  return String(conditions);
}

// Componente isolado para o Switch responder instantaneamente ao clique (Optimistic UI)
function StatusCell({
  rule,
  onToggleStatus,
}: {
  rule: AutomationRule;
  onToggleStatus: (id: string) => void;
}) {
  const [checked, setChecked] = useState(rule.status);

  const handleToggle = (newChecked: boolean) => {
    setChecked(newChecked); // Resposta imediata na tela (0ms de atraso)
    onToggleStatus(rule.id); // Executa a API em segundo plano
  };

  return (
    <div className="flex justify-center">
      <Switch
        checked={checked}
        onCheckedChange={handleToggle}
        className="scale-75"
      />
    </div>
  );
}

interface ColumnActionsProps {
  onToggleStatus: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (id: string) => void;
}

export const getColumns = ({
  onToggleStatus,
  onEdit,
  onDelete,
}: ColumnActionsProps): ColumnDef<AutomationRule>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <StatusCell
        key={`${row.original.id}-${row.original.status}`}
        rule={row.original}
        onToggleStatus={onToggleStatus}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Nome e Produto",
    cell: ({ row }) => {
      const rule = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {rule.name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Produto: {rule.product}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "scope",
    header: "Aplicada A",
    cell: ({ row }) => {
      const rule = row.original;
      return (
        <div>
          <span className="bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-500/20 font-medium whitespace-nowrap text-[11px]">
            {rule.scope}
          </span>
          <div className="text-[10px] mt-1 text-muted-foreground">
            Conta: {rule.account}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Ação e Condição",
    cell: ({ row }) => {
      const rule = row.original;

      const formattedAction = formatActionLabel(
        rule.action,
        rule.actionValue,
        rule.actionUnit,
      );

      const formattedConditions = renderConditions(rule.conditions);

      const isPause =
        rule.action?.toLowerCase().includes("pause") ||
        rule.action?.toLowerCase().includes("pausar");

      return (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "font-medium text-xs",
              isPause
                ? "text-orange-600 dark:text-orange-400"
                : "text-emerald-700 dark:text-emerald-400",
            )}
          >
            {formattedAction}
          </span>
          <span className="text-muted-foreground font-mono text-[11px] bg-muted/50 px-2 py-0.5 rounded border border-border/40 w-fit">
            SE: {formattedConditions}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "frequency",
    header: "Frequência e Período",
    cell: ({ row }) => {
      const rule = row.original;

      const formattedFreq = formatFrequencyLabel(rule.frequency);
      const formattedPeriod = formatPeriodLabel(rule.period);

      return (
        <div className="flex flex-col text-foreground text-xs">
          <span className="font-medium">{formattedFreq}</span>
          <span className="text-[10px] text-muted-foreground">
            Base: {formattedPeriod}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Ações</div>,
    cell: ({ row }) => {
      const rule = row.original;
      return (
        <div className="text-right pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-popover border-border text-popover-foreground shadow-md rounded-md"
            >
              <DropdownMenuItem
                onClick={() => onEdit(rule)}
                className="text-xs cursor-pointer focus:bg-accent focus:text-accent-foreground gap-2"
              >
                <Edit size={14} /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(rule.id)}
                className="text-xs cursor-pointer text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 focus:text-red-700 dark:focus:text-red-400 gap-2"
              >
                <Trash size={14} /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
