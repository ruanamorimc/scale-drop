"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import {
  Loader2,
  CreditCard,
  Banknote,
  Barcode,
  TrendingUp,
  ShoppingCart,
  Truck,
  MessageCircle,
  Plus,
  LayoutDashboard,
  RefreshCcw,
  DollarSign,
  TicketPercent,
  Crown,
  Package,
  Store,
  Scale,
  Tags,
  Megaphone,
  Download,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { getFinanceMetrics } from "@/actions/finance-overview";
import { saveFixedExpense, deleteFixedExpense } from "@/actions/fixed-expenses";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { FixedExpenseSheet } from "@/components/finance/FixedExpenseSheet";
import { columns } from "./_components/columns";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { cn } from "@/lib/utils";

// --- INTERFACES PARA MATAR O "ANY" ---
interface HeaderIconProps {
  icon: React.ElementType;
  colorClass?: string;
}

interface MetricRowProps {
  icon?: React.ElementType;
  label: string;
  value: number | string;
  count?: number;
  className?: string;
  isNegative?: boolean;
  iconColor?: string;
  isCurrency?: boolean;
}

// 1. CRIAMOS O CONTRATO EXATO DO QUE A SUA TELA PRECISA LER
interface FinanceData {
  totalPaid: number;
  countPaid: number;
  totalGenerated: number;
  countGenerated: number;
  totalPending: number;
  countPending: number;
  cardPaidValue: number;
  cardPaidCount: number;
  boletoPaidValue: number;
  boletoPaidCount: number;
  pixPaidValue: number;
  pixPaidCount: number;
  netProfit: number;
  roi: number;
  margin: number;
  adSpend: number;
  totalCostOfGoods: number;
  totalGatewayFees: number;
  totalTaxAmount: number;
  totalFixedExpenses: number;
  ticketAverage: number;
  totalShipping: number;
  totalDiscounts: number;
  abandonedCount: number;
  abandonedValue: number;
  fixedExpensesList: Record<string, unknown>[];
}

// --- ÍCONE GRANDE DO CABEÇALHO ---
const HeaderIcon = ({
  icon: Icon,
  colorClass = "text-blue-500",
}: HeaderIconProps) => (
  <div className="relative flex items-center justify-center">
    <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
      <div
        className={`p-1.5 rounded-full bg-background shadow-sm flex items-center justify-center ${colorClass}`}
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

// --- LINHA DA LISTA ---
const MetricRow = ({
  icon: Icon,
  label,
  value,
  count,
  className,
  isNegative,
  iconColor = "text-white",
  isCurrency = true,
}: MetricRowProps) => {
  const fmt = (v: number) =>
    v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 border-b border-border/40 dark:border-white/5 last:border-0",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
            <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
              <Icon size={14} className={iconColor} strokeWidth={2.5} />
            </div>
          </div>
        )}
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
      </div>
      <div className="text-right">
        <span
          className={cn(
            "text-sm font-semibold block",
            isNegative && "text-red-500 dark:text-red-400",
          )}
        >
          {isNegative ? "- " : ""}
          {typeof value === "number" && isCurrency ? fmt(value) : value}
        </span>
        {count !== undefined && (
          <span className="text-[10px] text-muted-foreground block">
            {count}
          </span>
        )}
      </div>
    </div>
  );
};

export default function FinanceOverviewPage() {
  const params = useParams();
  const workspaceId = params.slug as string; // Captura o ID da loja/workspace da URL
  // 2. APLICAMOS A INTERFACE AQUI
  const [data, setData] = useState<FinanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Record<
    string,
    unknown
  > | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const metrics = await getFinanceMetrics(
      workspaceId,
      dateRange?.from,
      dateRange?.to
    );
    setData(metrics as unknown as FinanceData);
    setIsLoading(false);
  }, [dateRange, workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveExpense = async (
    formData: Parameters<typeof saveFixedExpense>[0],
  ) => {
    const res = await saveFixedExpense(formData);
    if (res.success) {
      toast.success("Despesa salva");
      setIsExpenseSheetOpen(false);
      load();
    } else toast.error("Erro ao salvar");
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense || typeof deletingExpense.id !== "string") return;
    await deleteFixedExpense(deletingExpense.id);
    setDeletingExpense(null);
    load();
    toast.success("Despesa removida");
  };

  const fmt = (v: number) =>
    v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";

  const getProfitColor = (val: number) => {
    if (val === 0) return "text-foreground";
    if (val > 0) return "text-emerald-500";
    return "text-red-500";
  };

  const handleExportDRE = () => {
    if (!data) return toast.error("Sem dados para exportar.");

    const csvRows = [
      ["DRE - DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO"],
      [
        `Período: ${dateRange?.from?.toLocaleDateString()} a ${dateRange?.to?.toLocaleDateString()}`,
      ],
      [""],
      ["DESCRIÇÃO", "VALOR", "ANÁLISE VERTICAL (%)"],
      ["(+) Receita Bruta (Pedidos Pagos)", fmt(data.totalPaid), "100%"],
      [
        "(-) Descontos",
        fmt(data.totalDiscounts),
        ((data.totalDiscounts / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      ["(-) Cancelamentos/Reembolsos", fmt(0), "0.00%"],
      [
        "(=) RECEITA LÍQUIDA",
        fmt(data.totalPaid - data.totalDiscounts),
        "100%",
      ],
      [""],
      [
        "(-) Custo do Produto (CMV)",
        fmt(data.totalCostOfGoods),
        ((data.totalCostOfGoods / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      [
        "(-) Impostos Fiscais",
        fmt(data.totalTaxAmount),
        ((data.totalTaxAmount / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      [
        "(-) Taxas de Gateway/Plataforma",
        fmt(data.totalGatewayFees),
        ((data.totalGatewayFees / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      [
        "(-) Frete",
        fmt(data.totalShipping),
        ((data.totalShipping / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      [
        "(=) MARGEM DE CONTRIBUIÇÃO",
        fmt(
          (data.totalPaid || 0) -
            ((data.totalCostOfGoods || 0) +
              (data.totalGatewayFees || 0) +
              (data.totalTaxAmount || 0) +
              (data.adSpend || 0)),
        ),
        (
          (((data.totalPaid || 0) -
            ((data.totalCostOfGoods || 0) +
              (data.totalGatewayFees || 0) +
              (data.totalTaxAmount || 0) +
              (data.adSpend || 0))) /
            (data.totalPaid || 1)) *
          100
        ).toFixed(2) + "%",
      ],
      [""],
      [
        "(-) Marketing (Ads)",
        fmt(data.adSpend),
        ((data.adSpend / data.totalPaid) * 100).toFixed(2) + "%",
      ],
      [
        "(-) Despesas Fixas Operacionais",
        fmt(data.totalFixedExpenses || 0),
        (((data.totalFixedExpenses || 0) / data.totalPaid) * 100).toFixed(2) +
          "%",
      ],
      [""],
      [
        "(=) LUCRO LÍQUIDO (EBITDA)",
        fmt(data.netProfit),
        (data.margin || 0).toFixed(2) + "%",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      csvRows.map((e) => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `DRE_ScaleDrop_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("DRE exportada com sucesso!");
  };

  if (isLoading || !data)
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  const variableCosts =
    (data.totalCostOfGoods || 0) +
    (data.totalGatewayFees || 0) +
    (data.totalTaxAmount || 0) +
    (data.adSpend || 0);
  const contributionMarginVal = (data.totalPaid || 0) - variableCosts;
  const contributionMarginPercent =
    data.totalPaid > 0 ? contributionMarginVal / data.totalPaid : 0;

  const fixedCosts = data.totalFixedExpenses || 0;
  const breakEvenPoint =
    contributionMarginPercent > 0 ? fixedCosts / contributionMarginPercent : 0;
  const breakEvenProgress =
    breakEvenPoint > 0
      ? (data.totalPaid / breakEvenPoint) * 100
      : fixedCosts === 0
        ? 100
        : 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">
            Monitoramento financeiro e saúde da operação.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button variant="outline" className="gap-2" onClick={handleExportDRE}>
            <Download size={16} />{" "}
            <span className="hidden sm:inline">Exportar DRE</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <PremiumCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 dark:border-white/5">
              <div className="flex items-center gap-3">
                <HeaderIcon icon={DollarSign} colorClass="text-blue-500" />
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
                    Pedidos Pagos
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {fmt(data.totalPaid)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      {data.countPaid} un
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <MetricRow
                icon={LayoutDashboard}
                label="Pedidos Gerados"
                value={fmt(data.totalGenerated)}
                count={data.countGenerated}
              />
              <MetricRow
                icon={DollarSign}
                label="Pedidos Pendentes"
                value={fmt(data.totalPending)}
                count={data.countPending}
              />
              <MetricRow
                icon={CreditCard}
                label="Cartão Aprovado"
                value={fmt(data.cardPaidValue)}
                count={data.cardPaidCount}
              />
              <MetricRow
                icon={CreditCard}
                label="Cartão Pendente"
                value={fmt(0)}
                count={0}
              />
              <MetricRow
                icon={Barcode}
                label="Boleto Pago"
                value={fmt(data.boletoPaidValue)}
                count={data.boletoPaidCount}
              />
              <MetricRow
                icon={Barcode}
                label="Boleto Pendente"
                value={fmt(0)}
                count={0}
              />
              <MetricRow
                icon={Banknote}
                label="Pix Pago"
                value={fmt(data.pixPaidValue)}
                count={data.pixPaidCount}
                className="text-emerald-600 dark:text-emerald-500"
              />
              <MetricRow
                icon={Banknote}
                label="Pix Pendente"
                value={fmt(0)}
                count={0}
              />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 dark:border-white/5">
              <div className="flex items-center gap-3">
                <HeaderIcon
                  icon={TrendingUp}
                  colorClass={
                    data.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
                  }
                />
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
                    Lucro Líquido
                  </span>
                  <span
                    className={`text-2xl font-bold ${getProfitColor(data.netProfit)}`}
                  >
                    {fmt(data.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <MetricRow
                icon={TrendingUp}
                label="ROI"
                value={`${(data.roi || 0).toFixed(0)}%`}
                isCurrency={false}
              />
              <MetricRow
                icon={TicketPercent}
                label="Margem"
                value={`${(data.margin || 0).toFixed(1)}%`}
                isCurrency={false}
              />
              <MetricRow
                icon={Crown}
                label="CPA Real"
                value={fmt(
                  data.countPaid > 0 ? (data.adSpend || 0) / data.countPaid : 0,
                )}
              />

              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between py-2.5 border-b border-border/40 dark:border-white/5 cursor-help hover:bg-muted/10 -mx-1 px-1 rounded transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                          <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
                            <Megaphone size={14} className="text-white" />
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground">
                          Marketing (Ads)
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        - {fmt(data.adSpend || 0)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-3 bg-popover border-border shadow-xl">
                    <p className="text-xs font-bold mb-2 text-foreground">
                      Detalhamento Ads
                    </p>
                    <ul className="text-xs space-y-1 list-disc pl-3 text-muted-foreground">
                      <li>Facebook: {fmt((data.adSpend || 0) * 0.8)} (Est.)</li>
                      <li>Google: {fmt((data.adSpend || 0) * 0.2)} (Est.)</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <MetricRow
                icon={Package}
                label="Custo Produtos"
                value={data.totalCostOfGoods || 0}
                isNegative
              />
              <MetricRow
                icon={Wallet}
                label="Gateway + Taxas"
                value={data.totalGatewayFees || 0}
                isNegative
              />
              <MetricRow icon={Store} label="Checkout" value={0} isNegative />
              <MetricRow
                icon={Scale}
                label="Impostos"
                value={data.totalTaxAmount || 0}
                isNegative
              />
              <MetricRow
                icon={LayoutDashboard}
                label="Despesas Fixas"
                value={data.totalFixedExpenses || 0}
                isNegative
                className="text-red-500 font-medium"
              />
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40 dark:border-white/5">
              <div className="flex items-center gap-3">
                <HeaderIcon icon={TicketPercent} colorClass="text-foreground" />
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
                    Ticket Médio
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {fmt(data.ticketAverage || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <MetricRow
                icon={Truck}
                label="Frete"
                value={data.totalShipping || 0}
              />
              <MetricRow
                icon={Tags}
                label="Descontos"
                value={data.totalDiscounts || 0}
                isNegative
              />
              <MetricRow
                icon={RefreshCcw}
                label="Reembolsos"
                value={0}
                isNegative
                className="text-red-500"
              />
              <MetricRow
                icon={ShoppingCart}
                label="Carrinhos Abandonados"
                value={`${data.abandonedCount || 0} | ${fmt(data.abandonedValue || 0)}`}
                isCurrency={false}
                className="text-yellow-500"
              />
              <MetricRow
                icon={MessageCircle}
                label="Msgs Enviadas"
                value="Em breve"
                isCurrency={false}
                className="opacity-50 text-yellow-500"
              />
            </div>
          </div>
        </PremiumCard>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PremiumCard>
            <div className="p-0">
              <div className="p-5 border-b border-border/40 dark:border-white/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <HeaderIcon icon={CreditCard} colorClass="text-purple-500" />
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">
                      Despesas Fixas & Operacionais
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gastos com ferramentas, equipe e aluguel.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingExpense(null);
                    setIsExpenseSheetOpen(true);
                  }}
                >
                  <Plus size={14} className="mr-2" /> Adicionar
                </Button>
              </div>

              <div className="p-4">
                <DataTable
                  columns={columns as never}
                  data={data.fixedExpensesList || []}
                  pageSize={6}
                  meta={{
                    onEdit: (exp: Record<string, unknown>) => {
                      setEditingExpense(exp);
                      setIsExpenseSheetOpen(true);
                    },
                    onDelete: (exp: Record<string, unknown>) => {
                      setDeletingExpense(exp);
                    },
                  }}
                />
              </div>
            </div>
          </PremiumCard>
        </div>

        <div className="xl:col-span-1 h-full">
          <PremiumCard className="h-full">
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40 dark:border-white/5">
                <HeaderIcon icon={AlertCircle} colorClass="text-orange-500" />
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
                    Saúde da Operação
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Indicadores de sustentabilidade.
                  </span>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/40 dark:border-white/5">
                  <span className="text-xs uppercase text-muted-foreground font-bold">
                    Ponto de Equilíbrio (Break-even)
                  </span>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {fmt(breakEvenPoint)}
                  </p>
                  <div className="w-full bg-muted/50 h-2 mt-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all"
                      style={{ width: `${Math.min(breakEvenProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Você atingiu{" "}
                    <strong className="text-foreground">
                      {breakEvenProgress.toFixed(0)}%
                    </strong>{" "}
                    da meta.
                  </p>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border/40 dark:border-white/5">
                  <span className="text-xs uppercase text-muted-foreground font-bold">
                    Custo por Pedido (CPA)
                  </span>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {data.countPaid > 0
                      ? fmt((data.adSpend || 0) / data.countPaid)
                      : "R$ 0,00"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Gasto médio de ads para vender 1 produto.
                  </p>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border border-border/40 dark:border-white/5 opacity-80">
                  <span className="text-xs uppercase text-muted-foreground font-bold">
                    Cobertura de Custos
                  </span>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {data.netProfit > 0 && fixedCosts > 0
                      ? (data.netProfit / fixedCosts).toFixed(1) + "x"
                      : "--"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Quantas vezes o lucro paga o custo fixo.
                  </p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>

      <FixedExpenseSheet
        isOpen={isExpenseSheetOpen}
        onOpenChange={setIsExpenseSheetOpen}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      <AlertDialog
        open={!!deletingExpense}
        onOpenChange={() => setDeletingExpense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá recalcular seu lucro líquido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="text-white bg-destructive hover:bg-destructive/80 hover:shadow-[0_0_10px_1px_rgba(239,68,68,0.6)]"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
