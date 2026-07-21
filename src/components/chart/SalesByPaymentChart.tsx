"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Sector, Label } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { CustomTooltip } from "./CustomTooltip";

interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  value: number;
}

const chartConfig = {
  pix: { label: "Pix", color: "#1d4ed8" },
  cartao: { label: "Cartão", color: "#38bdf8" },
  boleto: { label: "Boleto", color: "#facc15" },
  outros: { label: "Outros", color: "#ef4444" },
} satisfies ChartConfig;

const renderActiveShape = (props: unknown) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props as ActiveShapeProps;

  if (fill === "#1e293b") {
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
        style={{ outline: "none" }}
      />
    );
  }

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        // 🔥 CORREÇÃO 2: Removido o "+ 4". Agora ele não infla ao passar o mouse.
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="none"
        style={{
          filter: `drop-shadow(0px 0px 8px ${fill}90)`,
          outline: "none",
        }}
      />
    </g>
  );
};

const renderCustomizedLabel = (props: unknown) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } =
    props as CustomLabelProps;

  if (value === 0 || value === 1) return null;

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

export default function SalesByPaymentChart({
  paymentData,
}: {
  paymentData?: Record<string, number>;
}) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const safeData = paymentData || {
    credit_card: 0,
    pix: 0,
    boleto: 0,
    outros: 0,
  };

  const originalData = [
    { name: "Pix", value: safeData.pix, color: "#1d4ed8" },
    { name: "Cartão", value: safeData.credit_card, color: "#38bdf8" },
    { name: "Boleto", value: safeData.boleto, color: "#facc15" },
    { name: "Outros", value: safeData.outros, color: "#ef4444" },
  ];

  const total = originalData.reduce((acc, curr) => acc + curr.value, 0);
  const isEmpty = total === 0;

  const chartData = isEmpty
    ? [{ name: "Vazio", value: 1, color: "#1e293b" }]
    : originalData.filter((d) => d.value > 0);

  const activeHoverItem =
    activeIndex !== undefined ? originalData[activeIndex] : null;

  return (
    <div className="flex flex-col h-full w-full pb-2">
      <style>{`
        @keyframes soft-pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2px var(--dot-color)); opacity: 0.7; }
          50% { filter: drop-shadow(0 0 8px var(--dot-color)); opacity: 1; }
        }
        .animate-glow-dot { animation: soft-pulse-glow 3s infinite ease-in-out; }
      `}</style>

      <div className="flex-1 w-full flex items-center justify-center relative min-h-[180px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px] w-full"
        >
          <PieChart>
            {!isEmpty && (
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
            )}

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={0}
              isAnimationActive={false}
              dataKey="value"
              onMouseEnter={(_, index) => {
                if (!isEmpty) {
                  const realIndex = originalData.findIndex(
                    (d) => d.name === chartData[index].name,
                  );
                  setActiveIndex(realIndex);
                }
              }}
              onMouseLeave={() => setActiveIndex(undefined)}
              activeIndex={
                isEmpty
                  ? undefined
                  : originalData.findIndex(
                      (d) => d.name === activeHoverItem?.name,
                    )
              }
              activeShape={renderActiveShape}
              labelLine={false}
              label={renderCustomizedLabel}
              stroke="transparent"
              style={{
                cursor: isEmpty ? "default" : "pointer",
                outline: "none",
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    outline: "none",
                    opacity: isEmpty
                      ? 1
                      : activeHoverItem === null ||
                          activeHoverItem.name === entry.name
                        ? 1
                        : 0.3,
                    transition: "opacity 0.3s ease",
                  }}
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
                        >
                          {activeHoverItem ? activeHoverItem.name : "Total"}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 14}
                          className="fill-foreground text-3xl font-bold transition-all duration-300"
                        >
                          {activeHoverItem ? activeHoverItem.value : total}
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
        {originalData.map((item, index) => {
          const isFaded =
            !isEmpty && activeIndex !== undefined && activeIndex !== index;

          return (
            <div
              key={item.name}
              onMouseEnter={() => !isEmpty && setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer transition-opacity duration-300"
              style={{ opacity: isFaded ? 0.4 : 1 }}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  !isFaded && "animate-glow-dot",
                )}
                style={
                  {
                    backgroundColor: item.color,
                    "--dot-color": item.color,
                  } as React.CSSProperties
                }
              />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
