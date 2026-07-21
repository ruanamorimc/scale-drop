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

// 1. Tipagem rigorosa para a propriedade que vai chegar do DashboardGrid
interface SalesByDayChartProps {
  salesData?: Record<string | number, number>;
}

const chartConfig = {
  sales: {
    label: "Total de vendas",
    color: "#1d4ed8", // Azul principal da referência
  },
} satisfies ChartConfig;

export default function SalesByDayChart({ salesData }: SalesByDayChartProps) {
  // 2. Mapeamento dos dias da semana (O JavaScript lê de 0 a 6, começando no Domingo)
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  // 3. Objeto de segurança caso os dados demorem a chegar
  const safeData = salesData || { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // 4. Descobre o total de vendas da semana para poder calcular a porcentagem
  const totalSales = Object.values(safeData).reduce((acc, val) => acc + val, 0);

  // 5. Monta o array exatamente no formato que o Recharts (e o seu mock) esperava
  const chartData = dayNames.map((day, index) => {
    const sales = safeData[index] || 0;
    // Evita divisão por zero e formata com uma casa decimal (ex: 28.8%)
    const percentage =
      totalSales > 0 ? ((sales / totalSales) * 100).toFixed(1) + "%" : "0.0%";

    return { day, sales, percentage };
  });

  return (
    <div className="flex-1 w-full h-full min-h-[200px] mt-2">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 0, left: 0, bottom: 0 }}
          >
            {/* Linhas horizontais sutis ao fundo */}
            <CartesianGrid
              vertical={false}
              stroke="#cccccc"
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />

            {/* Tooltip padrão do Shadcn, que já mostra a coluna destacada no fundo */}
            <ChartTooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
              content={<ChartTooltipContent indicator="dot" className="w-40" />}
            />

            <Bar
              dataKey="sales"
              fill="var(--color-sales)"
              radius={[2, 2, 0, 0]}
            >
              {/* O percentual no topo de cada coluna de forma dinâmica e condicional */}
              <LabelList
                dataKey="percentage"
                position="top"
                offset={8}
                className="fill-muted-foreground text-[11px] font-medium"
                // Truque sênior: se a venda for 0, não desenha o "0.0%" no topo para ficar mais limpo
                formatter={(value: string) => (value === "0.0%" ? "" : value)}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
