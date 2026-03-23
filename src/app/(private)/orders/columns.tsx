"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { StatusBadge } from "@/components/data-table/StatusBadge";
import { PaymentStatusBadge } from "@/components/data-table/PaymentStatusBadge";

const formatCurrency = (val: number | undefined) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val || 0);
};

export type Order = {
  id: string;
  invoiceId: string;
  date: string;
  time?: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  paymentStatus: "paid" | "pending" | "cancelled" | "refunded";
  paymentMethod: "Cartão de Crédito" | "Pix" | "Boleto";
  amount: number;
  cmv?: number;
  tax?: number;
  marketing?: number;
  netProfit?: number;
  status: string;
  items?: {
    name: string;
    price: number;
    image: string;
    quantity: number;
  }[];
};

export const columns: ColumnDef<Order>[] = [
  // 1. CHECKBOX
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. PEDIDO
  {
    accessorKey: "invoiceId",
    header: "Pedido",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1 min-w-[80px]">
          {/* CORRIGIDO: text-foreground */}
          <span className="font-bold text-foreground text-sm">
            {row.getValue("invoiceId")}
          </span>
          {/* CORRIGIDO: text-muted-foreground */}
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            {row.original.date}
            {row.original.time ? `, ${row.original.time}` : ""}
          </span>
        </div>
      );
    },
  },

  // 3. CLIENTE
  {
    accessorKey: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex items-center gap-3 min-w-[180px]">
          {/* CORRIGIDO: border-border */}
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={customer.avatar} />
            {/* CORRIGIDO: bg-muted text-muted-foreground */}
            <AvatarFallback className="bg-muted text-[10px] text-muted-foreground font-bold">
              {customer.name
                ? customer.name.substring(0, 2).toUpperCase()
                : "CLI"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            {/* CORRIGIDO: text-foreground */}
            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
              {customer.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
              {customer.email}
            </span>
          </div>
        </div>
      );
    },
  },

  // 4. PAGAMENTO
  {
    accessorKey: "paymentStatus",
    header: "Pagamento",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const method = row.original.paymentMethod;
      return (
        <div className="flex flex-col items-start gap-1 min-w-[100px]">
          <PaymentStatusBadge status={status} />
          <span className="text-[10px] text-muted-foreground ml-1 truncate max-w-[100px]">
            {method}
          </span>
        </div>
      );
    },
  },

  // 5. RECEITA
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-medium text-muted-foreground hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Receita <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      // CORRIGIDO: text-foreground (ou um cinza escuro)
      <div className="font-medium text-center text-foreground/90">
        {formatCurrency(row.getValue("amount"))}
      </div>
    ),
  },

  // 6. CUSTO PRODUTO (CMV)
  {
    accessorKey: "cmv",
    header: "Custo (CMV)",
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground text-sm">
        {formatCurrency(row.original.cmv)}
      </div>
    ),
  },

  // 7. TAXAS
  {
    accessorKey: "tax",
    header: "Taxas",
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground text-sm">
        {formatCurrency(row.original.tax)}
      </div>
    ),
  },

  // 8. MARKETING
  {
    accessorKey: "marketing",
    header: "Marketing",
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground text-sm">
        {formatCurrency(row.original.marketing)}
      </div>
    ),
  },

  // 9. LUCRO LÍQUIDO
  {
    accessorKey: "netProfit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-medium text-muted-foreground hover:text-foreground w-full justify-end"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lucro Líquido <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const profit = row.original.netProfit || 0;
      return (
        <div className="text-right">
          <span
            className={cn(
              "px-2 py-1 rounded-md text-xs font-bold border",
              // Essas cores (emerald/red) funcionam bem em light e dark
              profit > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
            )}
          >
            {formatCurrency(profit)}
          </span>
        </div>
      );
    },
  },

  // 10. STATUS ENTREGA
  {
    accessorKey: "status",
    header: ({ column }) => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusBadge status={row.getValue("status")} />
      </div>
    ),
  },

  // 11. AÇÕES
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          {/* CORRIGIDO: Removido bg-zinc-950, usando o padrão do componente (bg-popover) */}
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original.id)}
              className="cursor-pointer"
            >
              Copiar ID Interno
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Ver Detalhes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
