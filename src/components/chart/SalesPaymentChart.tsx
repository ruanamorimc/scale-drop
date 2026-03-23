"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Sector, Label } from "recharts";

// 🔥 1. Importando o esqueleto oficial de gráficos do Shadcn UI
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";

// 🔥 2. Importando o seu Tooltip Customizado
import { CustomTooltip } from "./CustomTooltip";

const data = [
  { name: "Pix", value: 18, color: "#1d4ed8" },
  { name: "Cartão", value: 10, color: "#38bdf8" },
  { name: "Boleto", value: 0, color: "#facc15" },
  { name: "Outros", value: 30, color: "#f43f5e" },
];

// Configuração de identificação obrigatória do Shadcn Chart
const chartConfig = {
  pix: { label: "Pix", color: "#1d4ed8" },
  cartao: { label: "Cartão", color: "#38bdf8" },
  boleto: { label: "Boleto", color: "#facc15" },
  outros: { label: "Outros", color: "#f43f5e" },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0px 0px 10px ${fill}90)`,
          outline: "none",
        }}
      />
    </g>
  );
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
}: any) => {
  if (value === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
      style={{ pointerEvents: "none" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SalesPaymentChart() {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const activeItem = activeIndex !== undefined ? data[activeIndex] : null;

  return (
    <div className="flex flex-col h-full w-full pb-2">
      <style>{`
        @keyframes soft-pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2px var(--dot-color)); opacity: 0.7; }
          50% { filter: drop-shadow(0 0 8px var(--dot-color)); opacity: 1; }
        }
        .animate-glow-dot { animation: soft-pulse-glow 3s infinite ease-in-out; }
      `}</style>

      {/* Trocamos o ResponsiveContainer puro por nossa div flex-1 */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-[180px]">
        {/* 🔥 O ChartContainer do Shadcn envolve o Recharts perfeitamente */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px] w-full"
        >
          <PieChart>
            {/* 🔥 Aqui chamamos o ChartTooltip nativo, passando o nosso arquivo Custom! */}
            <ChartTooltip cursor={false} content={<CustomTooltip />} />

            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="transparent"
              style={{ cursor: "pointer", outline: "none" }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ outline: "none" }}
                />
              ))}

              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ pointerEvents: "none" }}
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) - 12}
                          className="fill-muted-foreground text-sm transition-all duration-300"
                          style={{ pointerEvents: "none" }}
                        >
                          {activeItem ? activeItem.name : "Total"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 14}
                          className="fill-foreground text-3xl font-bold transition-all duration-300"
                          style={{ pointerEvents: "none" }}
                        >
                          {activeItem ? activeItem.value : total}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="flex items-center justify-center gap-5 mt-2 flex-wrap pb-4">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <div
              className="w-2 h-2 rounded-full animate-glow-dot"
              style={
                {
                  backgroundColor: item.color,
                  "--dot-color": item.color,
                } as React.CSSProperties
              }
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
