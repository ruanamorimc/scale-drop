"use client";

import { useState } from "react";
import {
  DollarSign,
  Package,
  Megaphone,
  Scale,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { toast } from "sonner";
import Image from "next/image";

// --- TIPAGENS ---
interface SummaryItemProps {
  title: string;
  value: string;
  trendPercentage?: number;
  icon: any;
  colorClass: string;
  bgClass: string;
  isValuesVisible: boolean;
}

interface MarketingCardProps {
  value: string;
  trendPercentage?: number;
  isValuesVisible: boolean;
  activePlatforms?: string[];
}

// --- HELPER DE FORMATAÇÃO ---
const f = (val: number) =>
  (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ==========================================
// 1. COMPONENTE PADRÃO (Lucro, Faturamento, etc)
// ==========================================
const SummaryItem = ({
  title,
  value,
  trendPercentage,
  icon: Icon,
  colorClass,
  bgClass,
  isValuesVisible,
}: SummaryItemProps) => {
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
        <div className={`p-1 rounded-full ${bgClass} shrink-0`}>
          <div
            className={`p-1.5 rounded-full ${colorClass} shadow-sm flex items-center justify-center text-white`}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex flex-col min-w-0 w-full">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            {title}
          </p>

          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "text-xl font-bold text-foreground tracking-tight truncate transition-all duration-300",
                !isValuesVisible && "blur-[5px] opacity-50 select-none",
              )}
            >
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

// ==========================================
// 2. CARD ESPECIAL DE MARKETING
// ==========================================
const MarketingCard = ({
  value,
  trendPercentage,
  isValuesVisible,
  activePlatforms = [],
}: MarketingCardProps) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const refreshPromise = new Promise((resolve) => {
      router.refresh();
      setTimeout(() => {
        setIsRefreshing(false);
        resolve(true);
      }, 1500);
    });
    toast.promise(refreshPromise, {
      loading: "Sincronizando gastos com anúncios...",
      success: "Custos de marketing atualizados!",
      error: "Erro ao sincronizar plataformas.",
    });
  };

  const rawTrend = trendPercentage || 0;
  const trendFormatted = Math.abs(rawTrend).toFixed(1);
  const hasTrend = rawTrend !== 0 && trendFormatted !== "0.0";
  const isTrendUp = rawTrend > 0;
  const TrendIcon = isTrendUp ? TrendingUp : TrendingDown;
  const trendBadgeClass = isTrendUp
    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20";

  // 🔥 Renderizador Dinâmico de Imagens Oficiais (Lendo da pasta public/logos)
  const renderPlatformIcons = () => {
    // Se não tiver nada no banco, não renderiza nada
    if (!activePlatforms || activePlatforms.length === 0) return null;

    // Mapeamento dos nomes do banco para os seus arquivos exatos
    const platformConfig: Record<
      string,
      { src: string; alt: string; zIndex: string; bg: string }
    > = {
      facebook: {
        src: "/logos/facebook.svg",
        alt: "Facebook Ads",
        zIndex: "z-30",
        bg: "bg-[#1877F2]",
      }, // Facebook costuma ser SVG com fundo transparente ou já redondo
      meta: {
        src: "/logos/facebook.svg",
        alt: "Meta Ads",
        zIndex: "z-30",
        bg: "bg-[#1877F2]",
      },
      google: {
        src: "/logos/google-ads.svg",
        alt: "Google Ads",
        zIndex: "z-20",
        bg: "bg-white",
      },
      tiktok: {
        src: "/logos/tiktok.svg",
        alt: "TikTok Ads",
        zIndex: "z-10",
        bg: "bg-black",
      },
    };

    return (
      <div className="flex -space-x-2">
        {activePlatforms.map((platform) => {
          const config = platformConfig[platform.toLowerCase()];
          if (!config) return null;

          return (
            <div
              key={platform}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2 border-background overflow-hidden shadow-sm shrink-0 p-0.5",
                config.zIndex,
                config.bg, // Cor de fundo de segurança caso o SVG seja vazado
              )}
              title={config.alt}
            >
              <Image
                src={config.src}
                alt={config.alt}
                width={16}
                height={16}
                className="object-contain w-full h-full"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PremiumCard className="hover:-translate-y-1 transition-transform duration-300 group">
      <div className="p-5 flex items-center gap-4">
        <div className="p-1 rounded-full bg-blue-600/10 shrink-0">
          <div className="p-1.5 rounded-full bg-blue-600 shadow-sm flex items-center justify-center text-white">
            <Megaphone size={18} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex flex-col w-full min-w-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Marketing
              </p>
              {renderPlatformIcons()}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-5 w-5 bg-black/5 dark:bg-white/5 border-border/50 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground transition-colors"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={10}
                className={cn(isRefreshing && "animate-spin")}
              />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <h3
              className={cn(
                "text-xl font-bold text-foreground tracking-tight truncate transition-all duration-300",
                !isValuesVisible && "blur-[5px] opacity-50 select-none",
              )}
            >
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

// ==========================================
// 3. EXPORTAÇÃO PRINCIPAL
// ==========================================
export function SummaryCards({ data }: { data: Record<string, any> }) {
  const d = data || {};
  const t = d.trends || {};

  const { isValuesVisible } = useDashboard();

  // 🔥 Agora ele lê ESTRITAMENTE o que vem do banco de dados na action getFinanceMetrics
  // Se o backend retornar ["facebook", "google"], ele desenha as duas. Se vier vazio, não desenha nada.
  const connectedMarketingPlatforms = d.activeAdPlatforms || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <SummaryItem
        title="Lucro"
        value={f(d.netProfit)}
        trendPercentage={t.profit}
        icon={DollarSign}
        colorClass="bg-emerald-600"
        bgClass="bg-emerald-600/10"
        isValuesVisible={isValuesVisible}
      />

      <SummaryItem
        title="Faturamento"
        value={f(d.totalPaid)}
        trendPercentage={t.revenue}
        icon={DollarSign}
        colorClass="bg-blue-600"
        bgClass="bg-blue-600/10"
        isValuesVisible={isValuesVisible}
      />

      <SummaryItem
        title="Custo dos Produtos"
        value={f(d.totalCostOfGoods)}
        trendPercentage={t.cost}
        icon={Package}
        colorClass="bg-blue-600"
        bgClass="bg-blue-600/10"
        isValuesVisible={isValuesVisible}
      />

      <MarketingCard
        value={f(d.adSpend)}
        trendPercentage={t.marketing}
        isValuesVisible={isValuesVisible}
        activePlatforms={connectedMarketingPlatforms} // Passando os dados reais do banco
      />

      <SummaryItem
        title="Taxas e Impostos"
        value={f((d.totalTaxAmount || 0) + (d.totalGatewayFees || 0))}
        trendPercentage={t.tax}
        icon={Scale}
        colorClass="bg-blue-600"
        bgClass="bg-blue-600/10"
        isValuesVisible={isValuesVisible}
      />
    </div>
  );
}
