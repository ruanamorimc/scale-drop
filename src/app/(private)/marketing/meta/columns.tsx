"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { MetaCampaign } from "./types";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- COMPONENTE AUXILIAR PARA HEADER COM TOOLTIP ---
const HeaderWithTooltip = ({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) => (
  <div className="flex items-center gap-1.5 cursor-help">
    <span className="whitespace-nowrap">{title}</span>
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={12} className="text-muted-foreground/50 shrink-0" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-xs font-normal bg-popover text-popover-foreground border-border shadow-md z-50">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

// --- STRICT FORMATTING FUNCTIONS (NO 'ANY') ---
const formatCurrency = (value: unknown) => {
  if (value === undefined || value === null) return "-";
  const numValue = Number(value);
  if (isNaN(numValue)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
};

const formatNumber = (value: unknown) => {
  if (value === undefined || value === null) return "-";
  const numValue = Number(value);
  if (isNaN(numValue)) return "-";
  return new Intl.NumberFormat("pt-BR").format(numValue);
};

const formatPercent = (value: unknown) => {
  if (value === undefined || value === null) return "-";
  const numValue = Number(value);
  if (isNaN(numValue)) return "-";
  return `${numValue.toFixed(2)}%`;
};

// --- DEFINIÇÃO DAS 65 COLUNAS MAPEADAS DO META-METRICS ---
export const getColumns = (
  level: string = "campanhas",
): ColumnDef<MetaCampaign>[] => [
  // ==============================
  // COLUNAS FIXAS DO SISTEMA
  // ==============================
  // ==============================
  // COLUNAS FIXAS DO SISTEMA
  // ==============================
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
        className="translate-y-[2px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 text-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 text-white"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const isActive = status === "ACTIVE" || status === true;
      return (
        <div className="flex items-center">
          <Switch
            checked={isActive}
            // O "!bg-white" força a bolinha a ficar branca e esmaga as regras do dark mode do componente base
            className="data-[state=checked]:bg-blue-600 [&>span]:!bg-white"
          />
        </div>
      );
    },
    size: 80,
  },

  // ==============================
  // CAMPANHA & CONFIGURAÇÃO
  // ==============================
  {
    accessorKey: "name",
    header:
      level === "contas"
        ? "Conta"
        : level === "conjuntos"
          ? "Conjunto"
          : level === "anuncios"
            ? "Anúncio"
            : "Campanha",
    cell: ({ row }) => {
      const nameValue = row.getValue("name") as string;
      return (
        <div className="flex flex-col">
          <span
            className="font-medium text-foreground text-sm truncate max-w-[300px]"
            title={nameValue}
          >
            {nameValue}
          </span>
        </div>
      );
    },
    size: 300,
    minSize: 200,
  },
  {
    accessorKey: "budget",
    header: () => (
      <HeaderWithTooltip
        title="Orçamento"
        tooltip="Limite de gasto diário ou total definido."
      />
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.getValue("budget"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "bid_cap",
    header: () => (
      <HeaderWithTooltip title="Bid Cap" tooltip="Limite de lance." />
    ),
    cell: ({ row }) => <div>{formatCurrency(row.getValue("bid_cap"))}</div>,
    size: 100,
  },
  {
    accessorKey: "account_status",
    header: "Status da Conta",
    cell: ({ row }) => (
      <div>{(row.getValue("account_status") as string) || "-"}</div>
    ),
    size: 120,
  },
  {
    accessorKey: "cycle",
    header: "Ciclo",
    cell: ({ row }) => <div>{(row.getValue("cycle") as string) || "-"}</div>,
    size: 100,
  },
  {
    accessorKey: "card",
    header: "Cartão",
    cell: ({ row }) => (
      <div className="text-xs">{(row.getValue("card") as string) || "-"}</div>
    ),
    size: 100,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("id") as string}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "last_update",
    header: "Última Atual.",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {(row.getValue("last_update") as string) || "-"}
      </div>
    ),
    size: 130,
  },
  {
    accessorKey: "meta_tax",
    header: () => (
      <HeaderWithTooltip
        title="Impostos Meta"
        tooltip="Impostos cobrados pela plataforma."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right text-red-400">
        {formatCurrency(row.getValue("meta_tax"))}
      </div>
    ),
    size: 120,
  },

  // ==============================
  // FINANCEIRO & PERFORMANCE
  // ==============================
  {
    accessorKey: "spent",
    header: () => (
      <HeaderWithTooltip
        title="Valor Gasto"
        tooltip="Total investido até o momento."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-red-500/80">
        {formatCurrency(row.getValue("spent"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "total_spent",
    header: () => (
      <HeaderWithTooltip
        title="Total Gasto"
        tooltip="Gasto total incluindo taxas."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-red-500/80">
        {formatCurrency(row.getValue("total_spent"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "revenue",
    header: () => (
      <HeaderWithTooltip
        title="Faturamento (Receita)"
        tooltip="Receita total confirmada."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-emerald-500">
        {formatCurrency(row.getValue("revenue"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "gross_revenue",
    header: () => (
      <HeaderWithTooltip
        title="Fat. Bruto"
        tooltip="Faturamento bruto total."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-emerald-500">
        {formatCurrency(row.getValue("gross_revenue"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "pending_revenue",
    header: () => (
      <HeaderWithTooltip
        title="Fat. Pendente"
        tooltip="Boletos e Pix aguardando pagamento."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-muted-foreground">
        {formatCurrency(row.getValue("pending_revenue"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "refunded_revenue",
    header: () => (
      <HeaderWithTooltip
        title="Fat. Reembolsado"
        tooltip="Valor de vendas estornadas."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium text-red-400">
        {formatCurrency(row.getValue("refunded_revenue"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "profit",
    header: () => (
      <HeaderWithTooltip
        title="Lucro"
        tooltip="Faturamento menos o Valor Gasto."
      />
    ),
    cell: ({ row }) => {
      const val = Number(row.getValue("profit"));
      return (
        <div
          className={`text-right font-bold ${val >= 0 ? "text-emerald-500" : "text-red-500"}`}
        >
          {formatCurrency(val)}
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "roas",
    header: () => (
      <HeaderWithTooltip title="ROAS" tooltip="Retorno sobre Ad Spend." />
    ),
    cell: ({ row }) => {
      const val = Number(row.getValue("roas"));
      return (
        <div
          className={`text-center font-bold px-2 py-0.5 rounded ${val >= 2 ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-600"}`}
        >
          {val ? val.toFixed(2) : "-"}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "roi",
    header: () => (
      <HeaderWithTooltip title="ROI" tooltip="Retorno sobre Investimento." />
    ),
    cell: ({ row }) => {
      const val = Number(row.getValue("roi"));
      return (
        <div
          className={`text-center font-bold px-2 py-0.5 rounded ${val >= 1.2 ? "bg-emerald-500/10 text-emerald-500" : "bg-yellow-500/10 text-yellow-600"}`}
        >
          {val ? val.toFixed(2) : "-"}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "margin",
    header: () => (
      <HeaderWithTooltip
        title="Margem (%)"
        tooltip="Margem de lucro sobre receita."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatPercent(row.getValue("margin"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "arpu",
    header: () => (
      <HeaderWithTooltip title="ARPU" tooltip="Receita média por usuário." />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("arpu"))}</div>
    ),
    size: 100,
  },

  // ==============================
  // CUSTOS
  // ==============================
  {
    accessorKey: "cpa",
    header: "CPA",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpa"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cpc",
    header: "CPC",
    cell: ({ row }) => (
      <div className="text-right text-xs">
        {formatCurrency(row.getValue("cpc"))}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "cpm",
    header: "CPM",
    cell: ({ row }) => (
      <div className="text-right text-xs">
        {formatCurrency(row.getValue("cpm"))}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "cpp",
    header: "CPP",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpp"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cpt",
    header: "CPT",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpt"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cpl",
    header: "CPL",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpl"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cpi",
    header: "CPI",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpi"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cost_per_ic",
    header: "Custo IC",
    cell: ({ row }) => (
      <div className="text-right">
        {formatCurrency(row.getValue("cost_per_ic"))}
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "cost_per_purchase_init",
    header: "Custo Init Check.",
    cell: ({ row }) => (
      <div className="text-right">
        {formatCurrency(row.getValue("cost_per_purchase_init"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "cpv",
    header: "CPV",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpv"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cps",
    header: "CPS",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cps"))}</div>
    ),
    size: 90,
  },

  // ==============================
  // CONVERSÕES
  // ==============================
  {
    accessorKey: "sales",
    header: "Vendas",
    cell: ({ row }) => (
      <div className="text-center font-semibold">
        {formatNumber(row.getValue("sales"))}
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "sales_pending",
    header: "Vendas (P)",
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground">
        {formatNumber(row.getValue("sales_pending"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "sales_total",
    header: "Vendas Totais",
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("sales_total"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "sales_rejected",
    header: "Vendas Recusadas",
    cell: ({ row }) => (
      <div className="text-center text-red-500">
        {formatNumber(row.getValue("sales_rejected"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "sales_refunded",
    header: "Vendas Reemb.",
    cell: ({ row }) => (
      <div className="text-center text-red-400">
        {formatNumber(row.getValue("sales_refunded"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "purchase_init",
    header: "IC",
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("purchase_init"))}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "ic_rate",
    header: "Taxa IC",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("ic_rate"))}
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "atc",
    header: "ATC",
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("atc"))}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "conversations_started",
    header: "Conversas",
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("conversations_started"))}
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "leads",
    header: "Leads",
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("leads"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "checkout_conversion",
    header: "Conv. Checkout",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("checkout_conversion"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "click_conversion",
    header: "Conv. Cliques",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("click_conversion"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "purchase_conversion",
    header: "Taxa Conv.",
    cell: ({ row }) => (
      <div className="text-center font-bold">
        {formatPercent(row.getValue("purchase_conversion"))}
      </div>
    ),
    size: 100,
  },

  // ==============================
  // ENGAJAMENTO
  // ==============================
  {
    accessorKey: "clicks",
    header: "Cliques",
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("clicks"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "ctr",
    header: "CTR",
    cell: ({ row }) => (
      <div className="text-center">{formatPercent(row.getValue("ctr"))}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "impressions",
    header: "Impressões",
    cell: ({ row }) => (
      <div className="text-center text-xs">
        {formatNumber(row.getValue("impressions"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "frequency",
    header: "Freq.",
    cell: ({ row }) => (
      <div className="text-center">
        {Number(row.getValue("frequency") || 0).toFixed(2)}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "page_views",
    header: "Vis. Pág.",
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("page_views"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "page_view_rate",
    header: "Taxa Vis. Pág.",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("page_view_rate"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "connection_rate",
    header: "Taxa Conexão",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("connection_rate"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "sales_per_page_view",
    header: "Vendas/Vis. Pág.",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("sales_per_page_view"))}
      </div>
    ),
    size: 120,
  },

  // ==============================
  // VÍDEO & CRIATIVO
  // ==============================
  {
    accessorKey: "video_retention_3s",
    header: "Retenção 3s",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_retention_3s"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_hook",
    header: "Hook (3s)",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_hook"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_hold_rate",
    header: "Hold Rate",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_hold_rate"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_body_conversion",
    header: "Conv. Body",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_body_conversion"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_body_retention",
    header: "Retenção Body",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_body_retention"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "video_cta",
    header: "Vídeo CTA",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_cta"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_play_rate_hook",
    header: "Play Rate Hook",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_play_rate_hook"))}
      </div>
    ),
    size: 110,
  },
  {
    accessorKey: "video_retention_75",
    header: "Retenção 75%",
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_retention_75"))}
      </div>
    ),
    size: 110,
  },

  // ==============================
  // OUTROS
  // ==============================
  {
    accessorKey: "followers",
    header: "Seguidores",
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("followers"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "product_costs",
    header: "Custos Produto",
    cell: ({ row }) => (
      <div className="text-right text-red-400">
        {formatCurrency(row.getValue("product_costs"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "ca",
    header: "CA",
    cell: ({ row }) => <div>{(row.getValue("ca") as string) || "-"}</div>,
    size: 100,
  },
  {
    accessorKey: "creation_date",
    header: "Criação",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {(row.getValue("creation_date") as string) || "-"}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "delivery_status",
    header: "Veiculação",
    cell: ({ row }) => (
      <div>{(row.getValue("delivery_status") as string) || "-"}</div>
    ),
    size: 110,
  },
];

export const columns = getColumns("campanhas");
