// src/components/chart/CustomTooltip.tsx
import React from "react";

export function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    // O PieChart do Recharts injeta os dados originais no payload
    const data = payload[0].payload;

    return (
      <div
        className="px-3 py-1.5 rounded-md text-white font-medium text-sm shadow-xl border border-white/20"
        style={{
          backgroundColor: data.color,
          pointerEvents: "none", // 🔥 Isso garante que o mouse "atravesse" o tooltip e não dê bugs
        }}
      >
        {data.name}: {data.value}
      </div>
    );
  }
  return null;
}
