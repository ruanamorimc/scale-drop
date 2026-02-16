"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { ProductStatusBadge } from "@/components/products/ProductStatusBadge";
import { Info } from "lucide-react";
import { Fee } from "@/app/(private)/finance/fees/columns";
import { Tax } from "@/app/(private)/finance/taxes/columns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// 1. CRIE ESSA INTERFACE ANTES DO "export const columns"
// Isso define o que estamos passando lá no "meta={{ ... }}" da page.tsx
interface ProductTableMeta {
  fees: Fee[];
  taxes: Tax[];
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
}

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
    //accessorKey: "taxes",
    header: "TAXAS + IMPOSTOS",
    cell: ({ row, table }) => {
      const product = row.original;
      const meta = table.options.meta as ProductTableMeta;
      const price = Number(product.salePrice) || 0;

      // Variáveis para montar o visual "7.49% + R$ 2.50"
      let totalPercentRate = 0; // Soma das % (ex: 7.49 + 6 = 13.49)
      let totalFixedValue = 0; // Soma dos fixos (ex: 2.50)

      // Variável para o cálculo real do dinheiro (O que vai pro Lucro Líquido)
      let totalMonetaryDeduction = 0;

      const breakdown: string[] = []; // Para o Tooltip

      // 1. Processar Taxas de Gateway (Fees)
      (meta?.fees || []).forEach((fee) => {
        if (fee.type === "PERCENTAGE") {
          totalPercentRate += fee.value;
          const val = price * (fee.value / 100);
          totalMonetaryDeduction += val;
          breakdown.push(`${fee.name}: ${fee.value}% (R$ ${val.toFixed(2)})`);
        } else {
          // Taxa Fixa (Ex: Saque R$ 2.50)
          totalFixedValue += Number(fee.value);
          totalMonetaryDeduction += Number(fee.value);
          breakdown.push(`${fee.name}: R$ ${Number(fee.value).toFixed(2)}`);
        }
      });

      // 2. Processar Impostos (Taxes) - Exceto Meta Ads
      (meta?.taxes || []).forEach((tax) => {
        // Ignora Ad Spend aqui
        if (tax.calculationRule === "faturamento" || !tax.calculationRule) {
          totalPercentRate += tax.rate;
          const val = price * (tax.rate / 100);
          totalMonetaryDeduction += val;
          breakdown.push(`${tax.name}: ${tax.rate}% (R$ ${val.toFixed(2)})`);
        }
      });

      // 3. Montar a Label Bonita "X% + R$ Y"
      const parts = [];
      if (totalPercentRate > 0) parts.push(`${totalPercentRate.toFixed(2)}%`);
      if (totalFixedValue > 0) parts.push(`R$ ${totalFixedValue.toFixed(2)}`);

      // Se não tiver taxa nenhuma, mostra "0%"
      const displayLabel = parts.length > 0 ? parts.join(" + ") : "0%";

      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex flex-col cursor-help group">
                {/* Valor em Dinheiro (Vermelho) */}
                <span className="font-bold text-red-600 dark:text-red-400">
                  - R${" "}
                  {totalMonetaryDeduction.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                {/* A Label Mágica: "7.49% + R$ 2.50" */}
                <span className="text-[10px] text-muted-foreground group-hover:text-red-500 transition-colors whitespace-nowrap">
                  {displayLabel}
                </span>
              </div>
            </TooltipTrigger>

            <TooltipContent className="bg-popover border-border p-3 shadow-xl max-w-[250px]">
              <div className="space-y-2 text-xs">
                <p className="font-bold text-muted-foreground mb-1">
                  Detalhamento
                </p>
                {breakdown.length > 0 ? (
                  <ul className="list-disc pl-3 space-y-0.5 text-foreground">
                    {breakdown.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">
                    Sem taxas cadastradas.
                  </span>
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-red-600 dark:text-red-400">
                  <span>Total:</span>
                  <span>R$ {totalMonetaryDeduction.toFixed(2)}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
    cell: ({ row, table }) => {
      const product = row.original;

      // Acessamos as taxas globais que passamos lá na page.tsx
      const meta = table.options.meta as ProductTableMeta;

      // 1. Valores do Produto
      const price = Number(product.salePrice) || 0;
      const cost = Number(product.costPrice) || 0;
      const shipping = Number(product.shipping) || 0; // Frete
      const taxML = Number(product.taxML) || 0; // Taxa fixa do ML (se tiver)

      // 2. Calcula as Taxas do Novo Sistema (Gateway + Impostos Gov)
      let systemDeductions = 0;

      // Gateway (Kirvano, etc)
      (meta?.fees || []).forEach((fee) => {
        if (fee.type === "PERCENTAGE") {
          systemDeductions += price * (fee.value / 100);
        } else {
          systemDeductions += Number(fee.value);
        }
      });

      // Impostos (Simples Nacional, etc - Ignora o Meta Ads aqui)
      (meta?.taxes || []).forEach((tax) => {
        if (tax.calculationRule === "faturamento" || !tax.calculationRule) {
          systemDeductions += price * (tax.rate / 100);
        }
      });

      // 3. Matemática Final
      // Lucro = Venda - (Custo Produto + Frete + Taxa ML + Taxas do Sistema)
      const totalCost = cost + shipping + taxML + systemDeductions;
      const profit = price - totalCost;

      // Margem %
      const margin = price > 0 ? (profit / price) * 100 : 0;
      const isPositive = profit > 0;

      return (
        <div
          className={`flex flex-col ${
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <span className="font-bold text-sm">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(profit)}
          </span>
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
