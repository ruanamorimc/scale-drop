"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodBadge } from "@/components/data-table/PaymentMethodBadge";

// Tipagem idêntica ao que vem do banco e da action getFees
export type Fee = {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  calculationRule?: string; // "faturamento" ou "venda"
  paymentMethod: string[];
};

export const columns: ColumnDef<Fee>[] = [
  {
    accessorKey: "name",
    header: "NOME/GATEWAY",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>
  },
  {
    accessorKey: "value",
    header: "TARIFA",
    cell: ({ row }) => {
      const fee = row.original;
      return (
        <span className="font-bold">
          {fee.type === "PERCENTAGE" 
            ? `${fee.value}%` 
            : `R$ ${fee.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        </span>
      );
    }
  },
  {
    accessorKey: "calculationRule",
    header: "REGRA",
    cell: ({ row }) => {
      const fee = row.original;
      
      // Lógica pedida: Só mostra regra se for porcentagem
      if (fee.type !== "PERCENTAGE") return <span className="text-muted-foreground">-</span>;

      // Mapeia o valor do banco para um texto amigável
      const ruleText = fee.calculationRule === "venda" ? "Sobre a Venda" : "Sobre o Faturamento";
      
      return (
        <Badge variant="secondary" className="font-normal">
          {ruleText}
        </Badge>
      );
    }
  },
  {
    accessorKey: "paymentMethod",
    header: "MÉTODOS",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.paymentMethod?.map((method) => (
          <PaymentMethodBadge key={method} method={method} />
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const fee = row.original;
      // Pega as funções passadas pelo componente pai (Page)
      const meta = table.options.meta as any; 

      return (
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-primary transition-colors"
            onClick={() => meta?.onEdit(fee)}
          >
            <Pencil size={16} />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-red-500 transition-colors"
            onClick={() => meta?.onDelete(fee)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];