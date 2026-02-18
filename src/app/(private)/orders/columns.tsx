"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react"; // Adicionei ArrowUpDown
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 👇 IMPORTANTE: Trazendo de volta o SEU componente original
import { StatusBadge } from "@/components/data-table/StatusBadge";
import { PaymentStatusBadge } from "@/components/data-table/PaymentStatusBadge";

export type Order = {
  id: string;
  invoiceId: string;
  date: string;
  time?: string; // Opcional caso não tenha nos dados antigos
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  // 👇 Mantive os nomes que vi no seu print de erro/dados
  paymentStatus: "paid" | "pending" | "cancelled" | "refunded";
  paymentMethod: "Cartão de Crédito" | "Pix" | "Boleto";
  amount: number;
  status: string; // <--- VOLTAMOS PARA "status" (antes estava deliveryStatus)
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

  // 2. PEDIDO (ID + DATA) - O novo visual que você gostou
  {
    accessorKey: "invoiceId",
    header: "Pedido",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-white">
            {row.getValue("invoiceId")}
          </span>
          {/* Fallback seguro caso 'time' não exista ainda */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {row.original.date}{" "}
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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-neutral-800">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback className="bg-neutral-800 text-xs text-neutral-400">
              {customer.name
                ? customer.name.substring(0, 2).toUpperCase()
                : "Cli"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-200">
              {customer.name}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {customer.email}
            </span>
          </div>
        </div>
      );
    },
  },

  // 4. PAGAMENTO (Visual novo colorido)
  {
    accessorKey: "paymentStatus",
    header: "Pagamento",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const method = row.original.paymentMethod;

      return (
        <div className="flex flex-col items-start gap-1">
          {/* Chamamos o componente isolado aqui 👇 */}
          <PaymentStatusBadge status={status} />

          {/* O método de pagamento continua aqui embaixo pequenininho */}
          <span className="text-[10px] text-muted-foreground ml-1">
            {method}
          </span>
        </div>
      );
    },
  },

  // 5. TOTAL
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end px-0"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="text-right font-medium text-white">{formatted}</div>;
    },
  },

  // 6. STATUS DE ENTREGA (AQUI ESTÁ A CORREÇÃO!)
  {
    accessorKey: "status", // <--- Voltamos para "status" para bater com seus dados
    header: "Entrega",
    cell: ({ row }) => {
      // 👇 AQUI: Usamos o SEU componente original que já trata as cores
      // Ele deve aceitar a string "status" que vem do dado
      return <StatusBadge status={row.getValue("status")} />;
    },
  },

  // 7. AÇÕES
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copiar ID Interno
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
