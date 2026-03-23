"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Link padrão e leve para desenhar o mapa mundi
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

interface SalesByCountryMapProps {
  showValues?: boolean;
}

export default function SalesByCountryMap({
  showValues = true,
}: SalesByCountryMapProps) {
  return (
    <div className="relative w-full h-full min-h-[250px] flex items-center justify-center bg-transparent mt-2">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#334155" // Cor dos continentes (slate-700)
                stroke="#0f172a" // Linha entre países
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#475569", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* 🔥 MARCADOR DO BRASIL */}
        <Marker coordinates={[-51.9253, -14.235]}>
          <circle cx={0} cy={0} r={12} fill="#3b82f6" opacity={0.3} />
          <circle cx={0} cy={0} r={4} fill="#3b82f6" />
          <text
            textAnchor="middle"
            y={-16}
            className={cn(
              "fill-white text-[12px] font-bold transition-all duration-300",
              !showValues && "blur-[4px] opacity-70 select-none", // Aplica o Blur se o olho fechar!
            )}
          >
            66
          </text>
        </Marker>
      </ComposableMap>

      {/* 🔥 CAIXINHA DE INFO (Esquerda) */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm border border-border/50 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm pointer-events-none">
        <div className="w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
          <Info size={10} className="text-blue-500" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          Clique nos marcadores para ver as métricas
        </span>
      </div>

      {/* 🔥 CAIXINHA N/A (Direita) */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-sm pointer-events-none text-right min-w-[130px]">
        <div className="text-[10.5px] text-muted-foreground font-medium mb-1.5">
          Vendas sem país
        </div>
        <div className="flex items-end justify-end gap-2">
          <span className="text-xl font-bold text-foreground leading-none flex items-center gap-1">
            N/A{" "}
            <span className="text-muted-foreground text-sm font-medium">=</span>
            <span
              className={cn(
                "transition-all duration-300",
                !showValues && "blur-[5px] opacity-70",
              )}
            >
              5
            </span>
          </span>
          <span className="text-blue-500 text-xs font-bold mb-[2px]">7.0%</span>
        </div>
      </div>
    </div>
  );
}
