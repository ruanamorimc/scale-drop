"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Importe o Badge
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/data-table/StatusBadge";

export type FixedExpense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string | Date;
};

// Cores para categorias
const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Ferramentas":
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case "Equipe":
      return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
    case "Infra":
      return "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20";
    case "Marketing":
      return "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const columns: ColumnDef<FixedExpense>[] = [
  {
    accessorKey: "description",
    header: "DESCRIÇÃO",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "CATEGORIA",
    cell: ({ row }) => (
      // O StatusBadge já cuida da cor, ícone e label sozinho!
      <div className="w-fit">
        <StatusBadge status={row.original.category} />
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "DATA",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {format(new Date(row.original.date), "dd/MM/yyyy", { locale: ptBR })}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">VALOR</div>,
    cell: ({ row }) => (
      <div className="text-right font-bold text-red-600 dark:text-red-400">
        {/* Sem sinal de menos aqui também, só a cor */}
        {row.original.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-primary"
            onClick={() => meta?.onEdit(row.original)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-500"
            onClick={() => meta?.onDelete(row.original)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      );
    },
  },
];
