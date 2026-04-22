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

// --- TIPAGENS ---
interface MetricIconProps {
  icon: any;
  colorClass: string;
  bgClass: string;
}

interface StandardMetricCardProps {
  title: string;
  value: string | number;
  subValue?: string | number;
  trend?: "up" | "down" | null;
  trendValue?: string | null;
  icon: any;
  color: string;
  bgColor: string;
  isValuesVisible: boolean; // Controla o Blur
}

// --- ÍCONE ---
const MetricIcon = ({ icon: Icon, colorClass, bgClass }: MetricIconProps) => (
  <div className={`p-1 rounded-full ${bgClass} shrink-0`}>
    <div
      className={`p-1.5 rounded-full ${colorClass} text-white shadow-sm flex items-center justify-center`}
    >
      <Icon size={18} strokeWidth={2.5} />
    </div>
  </div>
);

// --- CARD PADRÃO (Com lógica de Trend Condicional e Efeito Blur) ---
const StandardMetricCard = ({
  title,
  value,
  subValue,
  trend,
  trendValue, // Se null, não renderiza a badge
  icon,
  color,
  bgColor,
  isValuesVisible, // Recebe do pai
}: StandardMetricCardProps) => (
  <PremiumCard className="hover:bg-muted/20 transition-all duration-300 group">
    <div className="p-5 flex items-center gap-5 h-full">
      <MetricIcon icon={icon} colorClass={color} bgClass={bgColor} />

      <div className="flex flex-col w-full">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {title}
        </span>

        <div className="flex items-center gap-3">
          {/* 🔥 MÁGICA DO BLUR AQUI NO VALOR PRINCIPAL */}
          <h4
            className={cn(
              "text-xl font-bold text-foreground tracking-tight transition-all duration-300",
              !isValuesVisible && "blur-[5px] opacity-50 select-none", // Desfoque bancário
            )}
          >
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

        {/* 🔥 MÁGICA DO BLUR AQUI NO SUB-VALOR */}
        {subValue && (
          <p
            className={cn(
              "text-xs text-muted-foreground mt-0.5 font-medium transition-all duration-300",
              !isValuesVisible && "blur-[4px] opacity-40 select-none", // Desfoque levemente menor para subtexto
            )}
          >
            {subValue}
          </p>
        )}
      </div>
    </div>
  </PremiumCard>
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export function CardMetrics({ data }: { data: Record<string, any> }) {
  const d = data || {};
  const t = d.trends || {}; // Trends do Backend

  // Contexto Global para o Blur
  const { isValuesVisible } = useDashboard();

  // Helpers de Formatação
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
      trend: val > 0 ? "up" : ("down" as "up" | "down"),
      trendValue: `${formatted}%`,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 1. Pedidos Aprovados */}
      <StandardMetricCard
        title="Pedidos Aprovados"
        value={formatCurrency(d.totalPaid)}
        subValue={`(${d.countPaid || 0} pedidos)`}
        {...getTrendProps(t.orders)}
        icon={ShoppingCart}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />

      {/* 2. Pedidos Pendentes */}
      <StandardMetricCard
        title="Pedidos Pendentes"
        value={formatCurrency(d.totalPending)}
        subValue={`(${d.countPending || 0} pedidos)`}
        trend={d.totalPending > 0 ? "down" : undefined}
        trendValue={d.totalPending > 0 ? "Aguardando" : null}
        icon={Clock}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />

      {/* 3. Ticket Médio */}
      <StandardMetricCard
        title="Ticket Médio"
        value={formatCurrency(d.ticketAverage)}
        subValue="Média por venda"
        {...getTrendProps(t.ticket)}
        icon={Ticket}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />

      {/* 4. Margem de Lucro */}
      <StandardMetricCard
        title="Margem de Lucro"
        value={formatPercent(d.margin)}
        {...getTrendProps(t.margin)}
        icon={Percent}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />

      {/* 5. CAC */}
      <StandardMetricCard
        title="CAC"
        value={
          d.countPaid > 0 ? formatCurrency(d.adSpend / d.countPaid) : "R$ 0,00"
        }
        {...getTrendProps(t.cac)}
        icon={Users}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />

      {/* 6. ROI */}
      <StandardMetricCard
        title="ROI"
        value={formatPercent(d.roi)}
        {...getTrendProps(t.roi)}
        icon={Activity}
        color="bg-blue-600"
        bgColor="bg-blue-600/10"
        isValuesVisible={isValuesVisible} // Passando estado pro Blur
      />
    </div>
  );
}
