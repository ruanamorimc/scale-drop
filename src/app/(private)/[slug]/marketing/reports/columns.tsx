import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 🔥 IMPORTA AS MÉTRICAS DO SEU ARQUIVO CENTRAL
// Obs: Ajuste este caminho "@/lib/meta-metrics" para a pasta correta onde está o seu arquivo!
import { AVAILABLE_METRICS } from "@/constants/meta-metrics";

const HeaderWithTooltip = ({ label, tooltipText }: { label: string; tooltipText: string }) => (
  <div className="flex items-center justify-end gap-1.5 whitespace-nowrap w-full">
    {label}
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={12} className="text-muted-foreground/60 cursor-help hover:text-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border text-popover-foreground text-xs">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export function getColumns(): ColumnDef<any>[] {
  // 1. COLUNAS FIXAS DA ESQUERDA
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "data",
      header: "DATA",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue("data")}</span>,
    },
    {
      accessorKey: "dia",
      header: "DIA",
    },
  ];

  // 2. COLUNAS DINÂMICAS (Geradas automaticamente do seu meta-metrics.ts)
  const dynamicColumns: ColumnDef<any>[] = AVAILABLE_METRICS.map((metric) => ({
    accessorKey: metric.id,
    header: () => (
      <HeaderWithTooltip 
        label={metric.label.toUpperCase()} 
        tooltipText={`${metric.label} (${metric.category})`} 
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue(metric.id);
      // Se não houver dado para essa métrica, exibe um traço "-"
      const displayValue = value !== undefined && value !== null ? value : "-";
      return <div className="text-right">{displayValue as React.ReactNode}</div>;
    },
  }));

  return [...baseColumns, ...dynamicColumns];
}