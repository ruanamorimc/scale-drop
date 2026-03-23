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
  <div className="flex items-center gap-1.5 group cursor-help">
    <span className="whitespace-nowrap">{title}</span>
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info
            size={12}
            className="text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0"
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-xs font-normal bg-popover text-popover-foreground border-border shadow-md z-50">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

// --- FORMATAÇÃO VISUAL ---
const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatNumber = (value: number) => {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("pt-BR").format(value);
};

const formatPercent = (value: number) => {
  if (value === undefined || value === null) return "-";
  return `${value.toFixed(2)}%`;
};

// --- DEFINIÇÃO DAS COLUNAS (Tornei uma função para aceitar o nível dinâmico se precisar no futuro) ---
export const getColumns = (
  level: string = "campanhas",
): ColumnDef<MetaCampaign>[] => [
  // ==============================
  // 1. COLUNAS FIXAS
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
    size: 40, // Largura fixa pequena
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const isActive = status === "ACTIVE" || status === true;
      return (
        <div className="flex items-center">
          <Switch checked={isActive} />
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "name",
    // Header dinâmico baseado no nível (Campanha, Conjunto, Anúncio)
    header:
      level === "conjuntos"
        ? "Conjunto"
        : level === "anuncios"
          ? "Anúncio"
          : "Campanha",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span
          className="font-medium text-foreground text-sm truncate max-w-[300px]"
          title={row.getValue("name")}
        >
          {row.getValue("name")}
        </span>
        {/*         <span className="text-[10px] text-muted-foreground">
          {row.original.id}
        </span> */}
      </div>
    ),
    size: 300,
    minSize: 200,
  },

  // ==============================
  // 2. FINANCEIRO & PERFORMANCE
  // ==============================
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
    accessorKey: "revenue",
    header: () => (
      <HeaderWithTooltip
        title="Faturamento"
        tooltip="Receita total gerada pelas conversões."
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
    accessorKey: "profit",
    header: () => (
      <HeaderWithTooltip
        title="Lucro"
        tooltip="Faturamento menos o Valor Gasto."
      />
    ),
    cell: ({ row }) => {
      const val = row.getValue("profit") as number;
      return (
        <div
          className={`text-right font-bold ${
            val >= 0 ? "text-emerald-500" : "text-red-500"
          }`}
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
      <HeaderWithTooltip
        title="ROAS"
        tooltip="Retorno sobre Ad Spend (Receita / Gasto)."
      />
    ),
    cell: ({ row }) => {
      const val = row.getValue("roas") as number;
      return (
        <div
          className={`text-center font-bold px-2 py-0.5 rounded ${
            val >= 2
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-yellow-500/10 text-yellow-600"
          }`}
        >
          {val?.toFixed(2)}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "roi",
    header: () => (
      <HeaderWithTooltip
        title="ROI"
        tooltip="Retorno sobre Investimento (incluindo custos de produto)."
      />
    ),
    cell: ({ row }) => {
      const val = row.getValue("roi") as number;
      return (
        <div
          className={`text-center font-bold px-2 py-0.5 rounded ${
            // 🔥 Lógica de Cor: Se ROI maior que 1.2 fica verde, senão amarelo
            // Você pode alterar esse "1.2" para "1" ou "0" conforme sua regra de negócio
            val >= 1.2
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-yellow-500/10 text-yellow-600"
          }`}
        >
          {val?.toFixed(2)}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "margin",
    header: () => (
      <HeaderWithTooltip
        title="Margem"
        tooltip="Porcentagem de lucro sobre a receita."
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
  // 3. CUSTOS (CPA, CPC, ETC)
  // ==============================
  {
    accessorKey: "cpa",
    header: () => (
      <HeaderWithTooltip
        title="CPA"
        tooltip="Custo por Ação (Custo por Compra)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpa"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "cpc",
    header: () => (
      <HeaderWithTooltip
        title="CPC"
        tooltip="Custo médio por Clique no link."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right text-xs">
        {formatCurrency(row.getValue("cpc"))}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "cpm",
    header: () => (
      <HeaderWithTooltip title="CPM" tooltip="Custo por 1.000 Impressões." />
    ),
    cell: ({ row }) => (
      <div className="text-right text-xs">
        {formatCurrency(row.getValue("cpm"))}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "cpl",
    header: () => (
      <HeaderWithTooltip title="CPL" tooltip="Custo por Lead (Cadastro)." />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpl"))}</div>
    ),
    size: 100,
  },
  {
    accessorKey: "cpi",
    header: () => (
      <HeaderWithTooltip
        title="CPI"
        tooltip="Custo por Iniciação de Compra (Checkout)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpi"))}</div>
    ),
    size: 110,
  },
  {
    accessorKey: "cpp",
    header: () => (
      <HeaderWithTooltip title="CPP" tooltip="Custo por Venda Pendente." />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpp"))}</div>
    ),
    size: 100,
  },
  {
    accessorKey: "cpv",
    header: () => (
      <HeaderWithTooltip
        title="CPV"
        tooltip="Custo por Visualização de Página."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cpv"))}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "cps",
    header: () => (
      <HeaderWithTooltip
        title="CPS"
        tooltip="Custo por Seguidor no Instagram."
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cps"))}</div>
    ),
    size: 110,
  },

  // ==============================
  // 4. CONVERSÕES
  // ==============================
  {
    accessorKey: "sales",
    header: () => (
      <HeaderWithTooltip title="Vendas" tooltip="Compras confirmadas." />
    ),
    cell: ({ row }) => (
      <div className="text-center font-semibold">
        {formatNumber(row.getValue("sales"))}
      </div>
    ),
    size: 90,
  },
  {
    accessorKey: "sales_pending",
    header: () => (
      <HeaderWithTooltip
        title="Vendas (P)"
        tooltip="Compras aguardando pagamento (Boleto/Pix)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center text-muted-foreground">
        {formatNumber(row.getValue("sales_pending"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "sales_total",
    header: () => (
      <HeaderWithTooltip
        title="Vendas Totais"
        tooltip="Soma de vendas pagas e pendentes."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("sales_total"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "leads",
    header: () => (
      <HeaderWithTooltip title="Leads" tooltip="Cadastros realizados." />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("leads"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "atc",
    header: () => (
      <HeaderWithTooltip
        title="ATC"
        tooltip="Adições ao Carrinho (Add to Cart)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("atc"))}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "ic", // ID 'ic' ou 'purchase_init'
    header: () => (
      <HeaderWithTooltip
        title="IC (Checkout)"
        tooltip="Initiate Checkout (Início de finalização de compra)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("ic"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "checkout_conversion",
    header: () => (
      <HeaderWithTooltip
        title="Conv. Checkout"
        tooltip="Taxa de pessoas que compraram após iniciar checkout."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("checkout_conversion"))}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "purchase_conversion",
    header: () => (
      <HeaderWithTooltip
        title="Taxa Conv."
        tooltip="Vendas divididas por visualizações de página."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center font-bold">
        {formatPercent(row.getValue("purchase_conversion"))}
      </div>
    ),
    size: 100,
  },

  // ==============================
  // 5. ENGAJAMENTO & TRÁFEGO
  // ==============================
  {
    accessorKey: "clicks",
    header: () => (
      <HeaderWithTooltip title="Cliques" tooltip="Cliques no link (todos)." />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatNumber(row.getValue("clicks"))}</div>
    ),
    size: 90,
  },
  {
    accessorKey: "ctr",
    header: () => (
      <HeaderWithTooltip
        title="CTR"
        tooltip="Click Through Rate (Cliques / Impressões)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">{formatPercent(row.getValue("ctr"))}</div>
    ),
    size: 80,
  },
  {
    accessorKey: "impressions",
    header: () => (
      <HeaderWithTooltip
        title="Impressões"
        tooltip="Quantas vezes seus anúncios foram exibidos."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center text-xs">
        {formatNumber(row.getValue("impressions"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "frequency",
    header: () => (
      <HeaderWithTooltip
        title="Freq."
        tooltip="Média de vezes que cada pessoa viu seu anúncio."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {Number(row.getValue("frequency")).toFixed(2)}
      </div>
    ),
    size: 80,
  },
  {
    accessorKey: "page_views",
    header: () => (
      <HeaderWithTooltip
        title="Vis. Pág."
        tooltip="Visualizações da página de destino."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatNumber(row.getValue("page_views"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "connection_rate",
    header: () => (
      <HeaderWithTooltip
        title="Taxa Conexão"
        tooltip="Vis. Pág / Cliques no Link (Qualidade do carregamento)."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("connection_rate"))}
      </div>
    ),
    size: 110,
  },

  // ==============================
  // 6. VÍDEO & RETENÇÃO
  // ==============================
  {
    accessorKey: "video_hook",
    header: () => (
      <HeaderWithTooltip
        title="Hook (3s)"
        tooltip="% de pessoas que viram os primeiros 3 segundos."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_hook"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_hold_rate",
    header: () => (
      <HeaderWithTooltip title="Hold Rate" tooltip="Retenção média do vídeo." />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_hold_rate"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_retention_75",
    header: () => (
      <HeaderWithTooltip
        title="Ret. 75%"
        tooltip="% de pessoas que viram 75% do vídeo."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_retention_75"))}
      </div>
    ),
    size: 100,
  },
  {
    accessorKey: "video_cta",
    header: () => (
      <HeaderWithTooltip
        title="Vídeo CTA"
        tooltip="Cliques no link / Vídeos assistidos 75%."
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {formatPercent(row.getValue("video_cta"))}
      </div>
    ),
    size: 100,
  },

  // ==============================
  // 7. CONFIGURAÇÃO & OUTROS
  // ==============================
  {
    accessorKey: "bid_cap",
    header: () => (
      <HeaderWithTooltip
        title="Bid Cap"
        tooltip="Limite de lance configurado."
      />
    ),
    cell: ({ row }) => <div>{formatCurrency(row.getValue("bid_cap"))}</div>,
    size: 100,
  },
  {
    accessorKey: "account_status",
    header: () => (
      <HeaderWithTooltip
        title="Status Conta"
        tooltip="Status atual da conta de anúncios."
      />
    ),
    cell: ({ row }) => <div>{row.getValue("account_status")}</div>,
    size: 120,
  },
  {
    accessorKey: "cycle",
    header: "Ciclo",
    cell: ({ row }) => <div>{row.getValue("cycle")}</div>,
    size: 100,
  },
  {
    accessorKey: "card",
    header: "Cartão",
    cell: ({ row }) => <div className="text-xs">{row.getValue("card")}</div>,
    size: 100,
  },
  {
    accessorKey: "last_update",
    header: "Atualização",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("last_update")}
      </div>
    ),
    size: 130,
  },
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
    accessorKey: "creation_date",
    header: "Data Criação",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("creation_date")}
      </div>
    ),
    size: 120,
  },
];

// Compatibilidade para quando importar 'columns' diretamente sem função
export const columns = getColumns("campanhas");
