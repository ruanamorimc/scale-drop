"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Percent, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Tax = {
  id: string;
  name: string;
  rate: number;
  calculationRule?: string;
  isSystem: boolean;
};

export const columns: ColumnDef<Tax>[] = [
  {
    accessorKey: "name",
    header: "IMPOSTO/CUSTO",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>
  },
  {
    accessorKey: "calculationRule",
    header: "REGRA",
    cell: ({ row }) => {
      const rule = row.original.calculationRule;

      // Lógica do Ad Spend com Tooltip
      if (rule === "gasto_anuncio") {
        return (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="cursor-help flex items-center gap-1 w-fit bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                   Ad Spend <Info size={10} />
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 max-w-[200px]">
                <p>Calculado automaticamente sobre o gasto em anúncios BRL.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      // Regras comuns
      const label = rule === "comissao" ? "Sobre Comissão" : "Sobre Faturamento";
      return (
        <Badge variant="outline" className="font-normal capitalize whitespace-nowrap">
          {label}
        </Badge>
      );
    }
  },
  {
    accessorKey: "rate",
    header: "ALÍQUOTA",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-bold flex w-fit items-center gap-1">
        <Percent size={12} />
        {row.original.rate.toFixed(2)}%
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const tax = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-primary" 
            onClick={() => meta?.onEdit(tax)}
          >
            <Pencil size={16} />
          </Button>

          {!tax.isSystem && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:text-red-500" 
              onClick={() => meta?.onDelete(tax)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      );
    },
  },
];