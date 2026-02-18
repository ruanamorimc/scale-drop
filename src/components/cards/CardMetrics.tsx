"use client";

import {
  ShoppingCart,
  Clock,
  Ticket,
  Percent,
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { cn } from "@/lib/utils";

// --- ÍCONE (Sem alterações) ---
const MetricIcon = ({ icon: Icon, colorClass, bgClass }: any) => (
  <div className={`p-1 rounded-full ${bgClass} bg-opacity-20 shrink-0`}>
    <div
      className={`p-1.5 rounded-full ${colorClass} text-white shadow-sm flex items-center justify-center`}
    >
      <Icon size={18} strokeWidth={2.5} />
    </div>
  </div>
);

// --- CARD PADRÃO (Com lógica de Trend Condicional) ---
const StandardMetricCard = ({
  title,
  value,
  subValue,
  trend,
  trendValue, // Se null, não renderiza a badge
  icon,
  color,
  bgColor,
}: any) => (
  <PremiumCard className="hover:bg-muted/20 transition-all duration-300 group">
    <div className="p-5 flex items-center gap-5 h-full">
      <MetricIcon icon={icon} colorClass={color} bgClass={bgColor} />
      <div className="flex flex-col w-full">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {title}
        </span>
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-bold text-foreground tracking-tight">
            {value}
          </h4>

          {/* SÓ RENDERIZA SE TIVER TRENDVALUE */}
          {trendValue && (
            <div
              className={cn(
                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trend === "up"
                  ? "text-emerald-500 bg-emerald-500/10"
                  : "text-red-500 bg-red-500/10",
              )}
            >
              {trend === "up" ? (
                <TrendingUp size={10} className="mr-1" />
              ) : (
                <TrendingDown size={10} className="mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {subValue}
          </p>
        )}
      </div>
    </div>
  </PremiumCard>
);

// --- COMPONENTE PRINCIPAL ---
export function CardMetrics({ data }: { data: any }) {
  const d = data || {};
  const t = d.trends || {}; // Trends do Backend
  const { isValuesVisible } = useDashboard();
  const blur = (val: string) => (isValuesVisible ? val : "••••••");

  // Helpers
  const formatCurrency = (val: number) =>
    val?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";
  const formatPercent = (val: number) => `${(val || 0).toFixed(1)}%`;

  // --- LÓGICA ZERO TOLERANCE ---
  // Se valor for 0, retorna null para props de trend, escondendo a badge
  const getTrendProps = (val: number) => {
    const formatted = Math.abs(val || 0).toFixed(1);
    if (!val || formatted === "0.0") {
      return { trend: null, trendValue: null };
    }
    return {
      trend: val > 0 ? "up" : "down",
      trendValue: `${formatted}%`,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 1. Pedidos Aprovados */}
      <StandardMetricCard
        title="Pedidos Aprovados"
        value={blur(formatCurrency(d.totalPaid))}
        subValue={blur(`(${d.countPaid || 0} pedidos)`)}
        {...getTrendProps(t.orders)}
        icon={ShoppingCart}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 2. Pedidos Pendentes */}
      {/* Para pendentes, usamos a lógica de "Aguardando" apenas se > 0 */}
      <StandardMetricCard
        title="Pedidos Pendentes"
        value={blur(formatCurrency(d.totalPending))}
        subValue={blur(`(${d.countPending || 0} pedidos)`)}
        trend={d.totalPending > 0 ? "down" : undefined}
        trendValue={d.totalPending > 0 ? "Aguardando" : null}
        icon={Clock}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 3. Ticket Médio */}
      <StandardMetricCard
        title="Ticket Médio"
        value={blur(formatCurrency(d.ticketAverage))}
        subValue="Média por venda"
        {...getTrendProps(t.ticket)}
        icon={Ticket}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 4. Margem de Lucro */}
      <StandardMetricCard
        title="Margem de Lucro"
        value={blur(formatPercent(d.margin))}
        {...getTrendProps(t.margin)} // Agora usa o trend real em vez de "Saudável"
        icon={Percent}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 5. CAC */}
      <StandardMetricCard
        title="CAC"
        value={blur(
          d.countPaid > 0 ? formatCurrency(d.adSpend / d.countPaid) : "R$ 0,00",
        )}
        {...getTrendProps(t.cac)} // Trend real do CAC
        icon={Users}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />

      {/* 6. ROI */}
      <StandardMetricCard
        title="ROI"
        value={blur(formatPercent(d.roi))}
        {...getTrendProps(t.roi)} // Agora usa o trend real em vez de "Retorno"
        icon={Activity}
        color="bg-blue-600"
        bgColor="bg-gray-100 dark:bg-gray-800/50"
      />
    </div>
  );
}
