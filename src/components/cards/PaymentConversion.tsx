"use client";

import { CreditCard, Barcode, Banknote, PieChart } from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Button } from "@/components/ui/button";

// --- CARD INDIVIDUAL ---
const ConversionCard = ({
  title,
  icon,
  color,
  bgColor,
  ringColor,
  data,
}: any) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  // Fallback para evitar NaN
  const safeConversion = isNaN(data.conversion) ? 0 : data.conversion;
  const strokeDashoffset =
    circumference - (safeConversion / 100) * circumference;

  return (
    <PremiumCard className="hover:bg-muted/20 transition-all duration-300 group">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
              <div
                className={`p-1.5 rounded-full ${color} text-white shadow-sm`}
              >
                {icon}
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
{/*           <Button
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2"
          >
            Ver detalhes
          </Button> */}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="80" height="80" className="transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-muted/20"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={ringColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-muted-foreground font-medium">
                Conversão
              </span>
              <span className="text-sm font-bold text-foreground">
                {Math.round(safeConversion)}%
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {/* APROVADO */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Aprovado</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-foreground">
                  {data.approvedValue}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ({data.approvedCount})
                </span>
              </div>
            </div>

            {/* PENDENTE (Agora conectado) */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Pendente</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-foreground">
                  {data.pendingValue}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ({data.pendingCount})
                </span>
              </div>
            </div>

            {/* RECUSADO / VENCIDO (Agora conectado) */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  {title === "Boleto" ? "Vencido" : "Recusado"}
                </span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-foreground">
                  {data.refusedValue}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ({data.refusedCount})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

const PaymentDistributionCard = ({ data }: any) => {
  // Lendo os novos dados detalhados
  const m = data.metrics || { card: {}, pix: {}, boleto: {} };

  const cardCount = m.card.paidCount || 0;
  const pixCount = m.pix.paidCount || 0;
  const boletoCount = m.boleto.paidCount || 0;
  const totalPaidCount = cardCount + pixCount + boletoCount;

  const getPercent = (val: number) =>
    totalPaidCount > 0 ? Math.round((val / totalPaidCount) * 100) : 0;

  const cardPercent = getPercent(cardCount);
  const pixPercent = getPercent(pixCount);
  const boletoPercent = getPercent(boletoCount);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const generalConversion =
    data.countGenerated > 0
      ? Math.round((data.countPaid / data.countGenerated) * 100)
      : 0;

  return (
    <PremiumCard className="hover:bg-muted/20 transition-all duration-300 group">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
              <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm">
                <PieChart size={18} />
              </div>
            </div>
            <span className="text-sm font-medium text-foreground">
              Formas de Pagamento
            </span>
          </div>
{/*           <Button
            variant="ghost"
            className="h-6 text-[10px] text-muted-foreground hover:text-foreground px-2"
          >
            Ver detalhes
          </Button> */}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              className="transform -rotate-90"
            >
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#27272a"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#10b981"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${(pixPercent / 100) * circumference} ${circumference}`}
                className="transition-all duration-1000"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#9333ea"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${(cardPercent / 100) * circumference} ${circumference}`}
                strokeDashoffset={-1 * (pixPercent / 100) * circumference}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-muted-foreground font-medium">
                Conversão
              </span>
              <span className="text-sm font-bold text-foreground">
                {generalConversion}%
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                <span className="text-muted-foreground leading-none">
                  Cartão
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="block font-bold text-foreground leading-none mb-0.5">
                  {cardPercent}%
                </span>
                <span className="text-[9px] text-muted-foreground block leading-none">
                  ({cardCount}/{totalPaidCount})
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground leading-none">Pix</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="block font-bold text-foreground leading-none mb-0.5">
                  {pixPercent}%
                </span>
                <span className="text-[9px] text-muted-foreground block leading-none">
                  ({pixCount}/{totalPaidCount})
                </span>
              </div>
            </div>
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-muted-foreground leading-none">
                  Boleto
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="block font-bold text-foreground leading-none mb-0.5">
                  {boletoPercent}%
                </span>
                <span className="text-[9px] text-muted-foreground block leading-none">
                  ({boletoCount}/{totalPaidCount})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export function PaymentConversion({ data }: { data: any }) {
  const { isValuesVisible } = useDashboard();
  const blur = (val: string) => isValuesVisible ? val : "••••••";

  const f = (val: number) =>
    val?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";

  // Acessa o novo objeto 'metrics' que criamos no backend
  const m = data.metrics || {
    card: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
    pix: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
    boleto: {
      paid: 0,
      paidCount: 0,
      pending: 0,
      pendingCount: 0,
      refused: 0,
      refusedCount: 0,
    },
  };

  // Helper para calcular conversão por método
  const calcConv = (paid: number, pending: number, refused: number) => {
    const total = paid + pending + refused;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Resumo Geral */}
      <PaymentDistributionCard data={data} />

      {/* 2. Cartão */}
      <ConversionCard
        title="Cartão de Crédito"
        icon={<CreditCard size={18} />}
        color="bg-blue-600"
        ringColor="#9333ea"
        data={{
          conversion: calcConv(
            m.card.paidCount,
            m.card.pendingCount,
            m.card.refusedCount,
          ),
          approvedValue: blur(f(m.card.paid)),
          approvedCount: m.card.paidCount,
          pendingValue: blur(f(m.card.pending)),
          pendingCount: m.card.pendingCount,
          refusedValue: blur(f(m.card.refused)),
          refusedCount: m.card.refusedCount,
        }}
      />

      {/* 3. Pix */}
      <ConversionCard
        title="Pix"
        icon={<Banknote size={18} />}
        color="bg-blue-600"
        ringColor="#10b981"
        data={{
          conversion: calcConv(
            m.pix.paidCount,
            m.pix.pendingCount,
            m.pix.refusedCount,
          ),
          approvedValue: blur(f(m.pix.paid)),
          approvedCount: m.pix.paidCount,
          pendingValue: blur(f(m.pix.pending)),
          pendingCount: m.pix.pendingCount,
          refusedValue: blur(f(m.pix.refused)),
          refusedCount: m.pix.refusedCount,
        }}
      />

      {/* 4. Boleto */}
      <ConversionCard
        title="Boleto"
        icon={<Barcode size={18} />}
        color="bg-blue-600"
        ringColor="#3b82f6"
        data={{
          conversion: calcConv(
            m.boleto.paidCount,
            m.boleto.pendingCount,
            m.boleto.refusedCount,
          ),
          approvedValue: blur(f(m.boleto.paid)),
          approvedCount: m.boleto.paidCount,
          pendingValue: blur(f(m.boleto.pending)),
          pendingCount: m.boleto.pendingCount,
          refusedValue: blur(f(m.boleto.refused)),
          refusedCount: m.boleto.refusedCount,
        }}
      />
    </div>
  );
}
