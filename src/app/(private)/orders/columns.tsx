"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/data-table/StatusBadge"; // Importe o componente novo

// Tipo de dado (Isso deve vir do seu Prisma Schema futuramente)
export type Order = {
  id: string;
  invoiceId: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  dueDate: string;
  amount: number;
  status:
    | "pending"
    | "processing"
    | "delivered"
    | "failed"
    | "in_transit"
    | "shipped";
};

export const columns: ColumnDef<Order>[] = [
  // 1. Checkbox de seleção
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. Invoice ID (Estilo Mono/Código)
  {
    accessorKey: "invoiceId",
    header: "Invoice ID",
    cell: ({ row }) => (
      <div className="font-mono font-medium text-white">
        {row.getValue("invoiceId")}
      </div>
    ),
  },

  // 3. Customer (Nome e Email embaixo ou tooltip)
  {
    accessorKey: "customer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-200">{customer.name}</span>
          {/* <span className="text-xs text-muted-foreground hidden sm:inline">{customer.email}</span> */}
        </div>
      );
    },
  },

  // 4. Datas (Order e Due)
  {
    accessorKey: "date",
    header: "Data Pedido",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("date")}</div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Vencimento",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("dueDate")}</div>
    ),
  },

  // 5. Valor (Amount)
  {
    accessorKey: "amount",
    header: () => <div className="">Valor Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="font-medium text-white">{formatted}</div>;
    },
  },

  // 6. Status (Usando nosso Badge Personalizado)
  {
    accessorKey: "status",
    header: "Status de Entrega",
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} />;
    },
  },

  // 7. Ações (3 pontinhos)
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copiar ID Invoice
            </DropdownMenuItem>
            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
