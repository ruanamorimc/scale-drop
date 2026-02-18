"use client";

import { TrendingUp, Info } from "lucide-react";
import { PremiumCard } from "@/components/cards/PremiumCard";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Dados Mockados (Últimos 14 dias para dar esse efeito de "histórico recente")
const data = [
  { day: "01 Abr", value: 4000 },
  { day: "02 Abr", value: 3000 },
  { day: "03 Abr", value: 5000 },
  { day: "04 Abr", value: 8500 }, // Pico
  { day: "05 Abr", value: 6000 },
  { day: "06 Abr", value: 7500 },
  { day: "07 Abr", value: 9000 }, // Pico maior
  { day: "08 Abr", value: 2000 }, // Queda
  { day: "09 Abr", value: 6500 },
  { day: "10 Abr", value: 7000 },
  { day: "11 Abr", value: 7200 },
  { day: "12 Abr", value: 8000 },
  { day: "13 Abr", value: 4500 },
  { day: "14 Abr", value: 4000 },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b] border border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
          <span className="font-bold text-white text-sm">
            {Number(payload[0].value).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function SideMetrics() {
  // Encontra o valor máximo para definir cor diferente se quiser (opcional)
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <PremiumCard className="h-full flex flex-col justify-between overflow-hidden">
      <div className="p-6 pb-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-muted-foreground">
                Lucro Líquido
              </p>
              <TooltipProvider>
                <UiTooltip>
                  <TooltipTrigger>
                    <Info
                      size={12}
                      className="text-muted-foreground/50 hover:text-foreground transition-colors cursor-help"
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-xs">
                    <p>Lucro após dedução de todas as despesas.</p>
                  </TooltipContent>
                </UiTooltip>
              </TooltipProvider>
            </div>
            <h3 className="text-3xl font-bold text-foreground tracking-tight">
              R$ 11.491,24
            </h3>
          </div>

          {/* Badge de Tendência */}
          <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
            <TrendingUp size={14} className="text-emerald-500 mr-1" />
            <span className="text-xs font-bold text-emerald-500">+36%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Performance dos últimos 14 dias
        </p>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[180px] mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          >
            {/* Definição do Gradiente */}
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />{" "}
                {/* Emerald 400 */}
                <stop
                  offset="100%"
                  stopColor="#059669"
                  stopOpacity={0.6}
                />{" "}
                {/* Emerald 700 */}
              </linearGradient>
            </defs>

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />

            <Bar
              dataKey="value"
              fill="url(#emeraldGradient)"
              radius={[6, 6, 0, 0]} // Arredondado em cima
              barSize={undefined} // Deixa o tamanho automático para preencher
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              {/* Opcional: Adiciona lógica para destacar barras específicas */}
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  // Se quiser destacar o maior valor, descomente a linha abaixo:
                  // fill={entry.value === maxValue ? '#10b981' : 'url(#emeraldGradient)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </PremiumCard>
  );
}
