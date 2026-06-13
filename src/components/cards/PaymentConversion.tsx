"use client";

import { CreditCard, Barcode, PieChart } from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { cn } from "@/lib/utils";

// ==========================================
// TIPAGENS
// ==========================================
interface ConversionData {
  conversion: number;
  approvedValue: string;
  approvedCount: number;
  pendingValue: string;
  pendingCount: number;
  refusedValue: string;
  refusedCount: number;
}

interface ConversionCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  ringColor: string;
  data: ConversionData;
  isValuesVisible: boolean; // Recebe o status do Olho
}

interface PaymentMetrics {
  paid: number;
  paidCount: number;
  pending: number;
  pendingCount: number;
  refused: number;
  refusedCount: number;
}

export interface FinanceData {
  countPaid?: number;
  countGenerated?: number;
  metrics?: {
    card: PaymentMetrics;
    pix: PaymentMetrics;
    boleto: PaymentMetrics;
  };
  [key: string]: unknown; // Permite que o resto dos dados passe sem quebrar a tipagem
}

// ==========================================
// 1. ÍCONE DO PIX
// ==========================================
const PixIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M242.4 292.5c5.4-5.4 14.7-5.4 20.1 0l77 77c14.2 14.2 33.1 22 53.1 22l15.1 0-97.1 97.1c-30.3 29.5-79.5 29.5-109.8 0l-97.5-97.4 9.3 0c20 0 38.9-7.8 53.1-22l76.7-76.7zm20.1-73.6c-6.4 5.5-14.6 5.6-20.1 0l-76.7-76.7c-14.2-15.1-33.1-22-53.1-22l-9.3 0 97.4-97.4c30.4-30.3 79.6-30.3 109.9 0l97.2 97.1-15.2 0c-20 0-38.9 7.8-53.1 22l-77 77zM112.6 142.7c13.8 0 26.5 5.6 37.1 15.4l76.7 76.7c7.2 6.3 16.6 10.8 26.1 10.8 9.4 0 18.8-4.5 26-10.8l77-77c9.8-9.7 23.3-15.3 37.1-15.3l37.7 0 58.3 58.3c30.3 30.3 30.3 79.5 0 109.8l-58.3 58.3-37.7 0c-13.8 0-27.3-5.6-37.1-15.4l-77-77c-13.9-13.9-38.2-13.9-52.1 .1l-76.7 76.6c-10.6 9.8-23.3 15.4-37.1 15.4l-31.8 0-58-58c-30.3-30.3-30.3-79.5 0-109.8l58-58.1 31.8 0z" />
  </svg>
);

// ==========================================
// 1. CARD INDIVIDUAL (Cartão, Pix, Boleto)
// ==========================================
const ConversionCard = ({
  title,
  icon,
  color,
  ringColor,
  data,
  isValuesVisible,
}: ConversionCardProps) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  // Fallback para evitar NaN
  const safeConversion = isNaN(data.conversion) ? 0 : data.conversion;
  const strokeDashoffset =
    circumference - (safeConversion / 100) * circumference;

  // Classe padrão para aplicar o blur financeiro
  const blurClass = !isValuesVisible
    ? "blur-[5px] opacity-50 select-none transition-all duration-300"
    : "transition-all duration-300";

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
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Gráfico Circular */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="80" height="80" className="transform -rotate-90">
              {/* Trilha do Fundo (Adaptada para Light/Dark Mode) */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                strokeWidth="6"
                fill="transparent"
                className="stroke-zinc-200 dark:stroke-zinc-800"
              />
              {/* Linha de Progresso */}
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
              <span
                className={cn("text-sm font-bold text-foreground", blurClass)}
              >
                {Math.round(safeConversion)}%
              </span>
            </div>
          </div>

          {/* Dados e Valores */}
          <div className="flex-1 space-y-2">
            {/* APROVADO */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Aprovado</span>
              </div>
              <div className="text-right">
                <span
                  className={cn("block font-bold text-foreground", blurClass)}
                >
                  {data.approvedValue}
                </span>
                <span
                  className={cn("text-[9px] text-muted-foreground", blurClass)}
                >
                  ({data.approvedCount})
                </span>
              </div>
            </div>

            {/* PENDENTE */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Pendente</span>
              </div>
              <div className="text-right">
                <span
                  className={cn("block font-bold text-foreground", blurClass)}
                >
                  {data.pendingValue}
                </span>
                <span
                  className={cn("text-[9px] text-muted-foreground", blurClass)}
                >
                  ({data.pendingCount})
                </span>
              </div>
            </div>

            {/* RECUSADO / VENCIDO */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  {title === "Boleto" ? "Vencido" : "Recusado"}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={cn("block font-bold text-foreground", blurClass)}
                >
                  {data.refusedValue}
                </span>
                <span
                  className={cn("text-[9px] text-muted-foreground", blurClass)}
                >
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

// ==========================================
// 2. CARD DE DISTRIBUIÇÃO (Resumo Geral)
// ==========================================
const PaymentDistributionCard = ({
  data,
  isValuesVisible,
}: {
  data: FinanceData;
  isValuesVisible: boolean;
}) => {
  // 1. Fallback perfeito garantindo que todas as propriedades existam
  const emptyMetric: PaymentMetrics = {
    paid: 0,
    paidCount: 0,
    pending: 0,
    pendingCount: 0,
    refused: 0,
    refusedCount: 0,
  };
  const m = data.metrics || {
    card: emptyMetric,
    pix: emptyMetric,
    boleto: emptyMetric,
  };

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

  // 2. Proteção contra variáveis indefinidas na hora da divisão
  const countGen = data.countGenerated || 0;
  const countPaid = data.countPaid || 0;

  const generalConversion =
    countGen > 0 ? Math.round((countPaid / countGen) * 100) : 0;

  const blurClass = !isValuesVisible
    ? "blur-[4px] opacity-50 select-none transition-all duration-300"
    : "transition-all duration-300";

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
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              className="transform -rotate-90"
            >
              {/* Trilha do Fundo (Adaptada) */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                strokeWidth="6"
                fill="transparent"
                className="stroke-zinc-200 dark:stroke-zinc-800"
              />
              {/* 1. Círculo do Pix (Verde) */}
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
              {/* 1. Círculo do Cartão (Roxo) */}
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
              {/* 1. Círculo do Boleto (Laranja) */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#f97316"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${(boletoPercent / 100) * circumference} ${circumference}`}
                strokeDashoffset={
                  -1 * (pixPercent / 100) * circumference -
                  (cardPercent / 100) * circumference
                }
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[9px] text-muted-foreground font-medium">
                Conversão
              </span>
              <span
                className={cn("text-sm font-bold text-foreground", blurClass)}
              >
                {generalConversion}%
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {/* Linha Cartão */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                <span className="text-muted-foreground leading-none">
                  Cartão
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span
                  className={cn(
                    "block font-bold text-foreground leading-none mb-0.5",
                    blurClass,
                  )}
                >
                  {cardPercent}%
                </span>
                <span
                  className={cn(
                    "text-[9px] text-muted-foreground block leading-none",
                    blurClass,
                  )}
                >
                  ({cardCount}/{totalPaidCount})
                </span>
              </div>
            </div>
            {/* Linha Pix */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground leading-none">Pix</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span
                  className={cn(
                    "block font-bold text-foreground leading-none mb-0.5",
                    blurClass,
                  )}
                >
                  {pixPercent}%
                </span>
                <span
                  className={cn(
                    "text-[9px] text-muted-foreground block leading-none",
                    blurClass,
                  )}
                >
                  ({pixCount}/{totalPaidCount})
                </span>
              </div>
            </div>
            {/* Linha Boleto */}
            <div className="flex justify-between items-start text-xs">
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-muted-foreground leading-none">
                  Boleto
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span
                  className={cn(
                    "block font-bold text-foreground leading-none mb-0.5",
                    blurClass,
                  )}
                >
                  {boletoPercent}%
                </span>
                <span
                  className={cn(
                    "text-[9px] text-muted-foreground block leading-none",
                    blurClass,
                  )}
                >
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

// ==========================================
// 3. EXPORTAÇÃO PRINCIPAL
// ==========================================
export function PaymentConversion({ data }: { data: FinanceData }) {
  const { isValuesVisible } = useDashboard();

  const f = (val: number) =>
    val?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ||
    "R$ 0,00";

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

  const calcConv = (paid: number, pending: number, refused: number) => {
    const total = paid + pending + refused;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Resumo Geral */}
      <PaymentDistributionCard data={data} isValuesVisible={isValuesVisible} />

      {/* 2. Cartão */}
      <ConversionCard
        title="Cartão de Crédito"
        icon={<CreditCard size={18} />}
        color="bg-blue-600"
        ringColor="#9333ea"
        isValuesVisible={isValuesVisible}
        data={{
          conversion: calcConv(
            m.card.paidCount,
            m.card.pendingCount,
            m.card.refusedCount,
          ),
          approvedValue: f(m.card.paid),
          approvedCount: m.card.paidCount,
          pendingValue: f(m.card.pending),
          pendingCount: m.card.pendingCount,
          refusedValue: f(m.card.refused),
          refusedCount: m.card.refusedCount,
        }}
      />

      {/* 3. Pix */}
      <ConversionCard
        title="Pix"
        icon={<PixIcon size={18} />}
        color="bg-blue-600"
        ringColor="#10b981"
        isValuesVisible={isValuesVisible}
        data={{
          conversion: calcConv(
            m.pix.paidCount,
            m.pix.pendingCount,
            m.pix.refusedCount,
          ),
          approvedValue: f(m.pix.paid),
          approvedCount: m.pix.paidCount,
          pendingValue: f(m.pix.pending),
          pendingCount: m.pix.pendingCount,
          refusedValue: f(m.pix.refused),
          refusedCount: m.pix.refusedCount,
        }}
      />

      {/* 4. Boleto */}
      <ConversionCard
        title="Boleto"
        icon={<Barcode size={18} />}
        color="bg-blue-600"
        ringColor="#3b82f6"
        isValuesVisible={isValuesVisible}
        data={{
          conversion: calcConv(
            m.boleto.paidCount,
            m.boleto.pendingCount,
            m.boleto.refusedCount,
          ),
          approvedValue: f(m.boleto.paid),
          approvedCount: m.boleto.paidCount,
          pendingValue: f(m.boleto.pending),
          pendingCount: m.boleto.pendingCount,
          refusedValue: f(m.boleto.refused),
          refusedCount: m.boleto.refusedCount,
        }}
      />
    </div>
  );
}
