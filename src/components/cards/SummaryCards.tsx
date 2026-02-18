"use client";

import { useState } from "react";
import {
  DollarSign,
  Package,
  Megaphone,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw, // Ícone de Refresh mais limpo
} from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { toast } from "sonner"; // <--- IMPORTANTE: Importar o Toast

// --- HELPER DE FORMATAÇÃO ---
const f = (val: number) =>
  (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// --- COMPONENTE DE CARD PADRÃO ---
const SummaryItem = ({
  title,
  value,
  trendPercentage,
  icon: Icon,
  colorClass,
  bgClass,
}: any) => {
  // LÓGICA DE TREND RIGOROSA
  const rawTrend = trendPercentage || 0;
  const trendFormatted = Math.abs(rawTrend).toFixed(1);

  // Só mostra se for diferente de "0.0" E não for zero absoluto
  const hasTrend = rawTrend !== 0 && trendFormatted !== "0.0";
  const isTrendUp = rawTrend > 0;

  const TrendIcon = isTrendUp ? TrendingUp : TrendingDown;
  const trendBadgeClass = isTrendUp
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20";

  return (
    <PremiumCard className="hover:-translate-y-1 transition-transform duration-300 group">
      <div className="p-5 flex items-center gap-4">
        {/* LADO ESQUERDO */}
        <div className={`p-1 rounded-full ${bgClass} bg-opacity-20 shrink-0`}>
          <div
            className={`p-1.5 rounded-full ${colorClass} shadow-sm flex items-center justify-center text-white`}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            {title}
          </p>

          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground tracking-tight truncate">
              {value}
            </h3>

            {hasTrend && (
              <div
                className={cn(
                  "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                  trendBadgeClass,
                )}
              >
                <TrendIcon size={10} className="mr-1" strokeWidth={3} />
                {trendFormatted}%
              </div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

// --- CARD DE MARKETING ESPECIAL (COM FEEDBACK DE REFRESH) ---
const MarketingCard = ({ value, trendPercentage }: any) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    // Evita cliques duplos
    if (isRefreshing) return;

    setIsRefreshing(true);

    // Cria a promessa para o Toast animado
    const refreshPromise = new Promise((resolve) => {
      // 1. Dispara a atualização dos dados
      router.refresh();

      // 2. Simula um tempinho de API (1.5s) para o usuário ver o loading
      setTimeout(() => {
        setIsRefreshing(false);
        resolve(true);
      }, 1500);
    });

    // Exibe o Toast
    toast.promise(refreshPromise, {
      loading: "Sincronizando gastos com anúncios...",
      success: "Custos de marketing atualizados!",
      error: "Erro ao sincronizar plataformas.",
    });
  };

  // Lógica de trend igual ao padrão
  const rawTrend = trendPercentage || 0;
  const trendFormatted = Math.abs(rawTrend).toFixed(1);
  const hasTrend = rawTrend !== 0 && trendFormatted !== "0.0";
  const isTrendUp = rawTrend > 0;
  const TrendIcon = isTrendUp ? TrendingUp : TrendingDown;
  const trendBadgeClass = isTrendUp
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20";

  return (
    <PremiumCard className="hover:-translate-y-1 transition-transform duration-300 group">
      <div className="p-5 flex items-center gap-4">
        {/* 1. ÍCONE MEGAFONE */}
        <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50 bg-opacity-20 shrink-0">
          <div className="p-1.5 rounded-full bg-blue-600 shadow-sm flex items-center justify-center text-white">
            <Megaphone size={18} strokeWidth={2.5} />
          </div>
        </div>

        {/* 2. CONTEÚDO */}
        <div className="flex flex-col w-full min-w-0">
          {/* Header: Título + Ícones + Botão Refresh */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Marketing
              </p>
              {/* Ícones de Plataforma */}
              <div className="flex -space-x-1.5">
                <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center border border-background text-[6px] font-bold text-white">
                  f
                </div>
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center border border-background text-[6px] font-bold text-red-500">
                  G
                </div>
              </div>
            </div>

            {/* Botão Refresh com Feedback */}
            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 bg-zinc-800/50 border-white/10 hover:bg-zinc-700 hover:text-white transition-colors"
              onClick={handleRefresh}
              disabled={isRefreshing} // Desabilita enquanto carrega
            >
              <RefreshCw
                size={10}
                className={cn(isRefreshing && "animate-spin")}
              />
            </Button>
          </div>

          {/* Valor + Trend */}
          <div className="flex items-center gap-2 mt-0.5">
            <h3 className="text-xl font-bold text-foreground tracking-tight truncate">
              {value}
            </h3>
            {hasTrend && (
              <div
                className={cn(
                  "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border",
                  trendBadgeClass,
                )}
              >
                <TrendIcon size={10} className="mr-1" strokeWidth={3} />
                {trendFormatted}%
              </div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

// --- EXPORTAÇÃO PRINCIPAL ---
export function SummaryCards({ data }: { data: any }) {
  const d = data || {};
  const t = d.trends || {};

  // Contexto para o efeito "Olho" (Blur)
  const { isValuesVisible } = useDashboard();
  const blur = (val: string) => (isValuesVisible ? val : "••••••");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {/* 1. LUCRO */}
      <SummaryItem
        title="Lucro"
        value={blur(f(d.netProfit))}
        trendPercentage={t.profit}
        icon={DollarSign}
        colorClass="bg-emerald-600"
        bgClass="bg-emerald-600/10"
      />

      {/* 2. FATURAMENTO */}
      <SummaryItem
        title="Faturamento"
        value={blur(f(d.totalPaid))}
        trendPercentage={t.revenue}
        icon={DollarSign}
        colorClass="bg-blue-600"
        bgClass="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 3. CUSTO PRODUTOS */}
      <SummaryItem
        title="Custo dos Produtos"
        value={blur(f(d.totalCostOfGoods))}
        trendPercentage={t.cost}
        icon={Package}
        colorClass="bg-blue-600"
        bgClass="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 4. MARKETING (Com Refresh) */}
      <MarketingCard value={blur(f(d.adSpend))} trendPercentage={t.marketing} />

      {/* 5. TAXAS E IMPOSTOS */}
      <SummaryItem
        title="Taxas e Impostos"
        value={blur(f((d.totalTaxAmount || 0) + (d.totalGatewayFees || 0)))}
        trendPercentage={t.tax}
        icon={Scale}
        colorClass="bg-blue-600"
        bgClass="bg-gray-100 dark:bg-gray-800/50"
      />
    </div>
  );
}
