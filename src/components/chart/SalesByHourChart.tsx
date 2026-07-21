"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// 1. Tipagem exata do que o backend agora envia
interface SalesByHourData {
  hour: string;
  salesCount: number;
}

interface SalesByHourChartProps {
  chartData?: SalesByHourData[];
}

const chartConfig = {
  sales: {
    label: "Total de vendas",
    color: "#1d4ed8", // O azul da sua paleta
  },
} satisfies ChartConfig;

export default function SalesByHourChart({
  chartData = [],
}: SalesByHourChartProps) {
  // 2. Cria o array de 24 horas de segurança caso os dados demorem a chegar
  const safeData =
    chartData.length > 0
      ? chartData
      : Array.from({ length: 24 }, (_, i) => ({
          hour: `${String(i).padStart(2, "0")}:00`,
          salesCount: 0,
        }));

  // 3. Descobre o total de vendas do dia para calcular as porcentagens de cada hora
  const totalSales = safeData.reduce(
    (acc, val) => acc + (val.salesCount || 0),
    0,
  );

  // 4. Formata os dados para o formato exato que o Recharts espera
  const processedData = safeData.map((item) => {
    const sales = item.salesCount || 0;
    const percentage =
      totalSales > 0 ? ((sales / totalSales) * 100).toFixed(1) + "%" : "0.0%";

    return {
      hour: item.hour,
      sales: sales,
      percentage: percentage,
    };
  });

  return (
    <div className="flex-1 w-full h-full min-h-[200px] mt-2">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            margin={{ top: 25, right: 10, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.2}
            />

            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval="preserveStartEnd" // Garante que a primeira e última hora apareçam
            />

            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" className="w-40" />}
            />

            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[2, 2, 0, 0]}
            >
              <LabelList
                dataKey="percentage"
                position="top"
                offset={8}
                className="fill-muted-foreground text-[9px] font-medium"
                // Oculta visualmente os "0.0%" em horas sem venda para o gráfico ficar limpo
                formatter={(value: string) => (value === "0.0%" ? "" : value)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
