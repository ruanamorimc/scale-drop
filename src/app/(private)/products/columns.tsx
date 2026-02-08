"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
// Removi o Badge daqui, pois vamos usar o nosso customizado
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
// 👇 Importe o novo componente
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";

// Tipo do Produto
export type Product = {
  id: string;
  image: string;
  name: string;
  status: string;
  stock: number;
  salePrice: number;
  costPrice: number;
  taxML: number;
  shipping: number;
  category: string;
  store: string;
  sku?: string | null;       
  externalId?: string | null;
  supplierUrl?: string | null;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const columns: ColumnDef<Product>[] = [
  // 1. Checkbox
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
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. PRODUTO (FOTO + NOME + SKU + ESTOQUE)
  {
    accessorKey: "name",
    header: "Produto",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4 py-1">
          <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal"
            />
          </div>
          <div className="flex flex-col min-w-[180px]">
            <span
              className="font-semibold text-sm line-clamp-1"
              title={product.name}
            >
              {product.name}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{product.id}</span>
              <span>•</span>
              <span>{product.stock} un.</span>
            </div>
          </div>
        </div>
      );
    },
  },

  // 3. PREÇO VENDA
  {
    accessorKey: "salePrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-transparent"
        >
          Venda
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.getValue("salePrice"))}
      </div>
    ),
  },

  // 4. CUSTO (CMV)
  {
    accessorKey: "costPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 hover:bg-transparent text-muted-foreground"
      >
        Custo (CMV) <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatCurrency(row.getValue("costPrice"))}
      </div>
    ),
  },
    // 5. MARGEM BRUTA 
  {
    id: "grossMargin",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-4 hover:bg-transparent text-muted-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Margem Bruta <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const p = row.original;
      // Cálculo: Preço Venda - Custo Produto
      const grossProfit = p.salePrice - p.costPrice;
      const margin = p.salePrice > 0 ? (grossProfit / p.salePrice) * 100 : 0;

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground/90">
            {formatCurrency(grossProfit)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {margin.toFixed(0)}%
          </span>
        </div>
      );
    },
  },

  // 6. TAXAS
  {
    id: "tax",
    header: () => <span className="text-muted-foreground">Taxas</span>,
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>{formatCurrency(p.taxML)} (Taxa)</span>
          {p.shipping > 0 && (
            <span>+ {formatCurrency(p.shipping)} (Frete)</span>
          )}
        </div>
      );
    },
  },


  // 7. LUCRO LÍQ.
  {
    id: "profit",
    header: ({ column }) => (
      <Button variant="ghost" className="-ml-4 hover:bg-transparent">
        Lucro Líq.
      </Button>
    ),
    cell: ({ row }) => {
      const p = row.original;
      const totalCost = p.costPrice + p.taxML + p.shipping;
      const profit = p.salePrice - totalCost;
      const margin = (profit / p.salePrice) * 100;
      const isPositive = profit > 0;

      return (
        <div
          className={`flex flex-col ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          <span className="font-bold text-sm">{formatCurrency(profit)}</span>
          <span className="text-[10px] opacity-80">{margin.toFixed(1)}%</span>
        </div>
      );
    },
  },

  // 8. STATUS (AGORA USA O COMPONENTE NOVO) 👇
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      // Simples e limpo: chama o componente passando a string
      return <ProductStatusBadge status={row.getValue("status")} />;
    },
  },

  // 9. AÇÕES
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onEdit: (product: Product) => void;
        onDelete: (product: Product) => void;
      };

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => meta?.onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => meta?.onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
