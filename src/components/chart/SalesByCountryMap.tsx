"use client";

import React, { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// 🔥 1. DICIONÁRIO DE COORDENADAS GLOBAL (Lat/Lng)
//(Se no futuro você fizer vendas para um país muito exótico que não está aqui, basta pesquisar no Google "Longitude and Latitude of [País]" e adicionar nessa lista!)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  // América do Sul
  BR: [-51.9253, -14.235],
  Brazil: [-51.9253, -14.235],
  Brasil: [-51.9253, -14.235],
  AR: [-63.6167, -38.4161],
  Argentina: [-63.6167, -38.4161],
  CO: [-74.2973, 4.5709],
  Colombia: [-74.2973, 4.5709],
  Colômbia: [-74.2973, 4.5709],
  CL: [-71.543, -35.6751],
  Chile: [-71.543, -35.6751],
  PE: [-75.0152, -9.19],
  Peru: [-75.0152, -9.19],
  UY: [-55.7658, -32.5228],
  Uruguay: [-55.7658, -32.5228],
  Uruguai: [-55.7658, -32.5228],
  PY: [-58.4438, -23.4425],
  Paraguay: [-58.4438, -23.4425],
  Paraguai: [-58.4438, -23.4425],
  EC: [-78.1834, -1.8312],
  Ecuador: [-78.1834, -1.8312],
  Equador: [-78.1834, -1.8312],
  VE: [-66.5897, 6.4238],
  Venezuela: [-66.5897, 6.4238],

  // América do Norte e Central
  US: [-95.7129, 37.0902],
  "United States": [-95.7129, 37.0902],
  EUA: [-95.7129, 37.0902],
  "Estados Unidos": [-95.7129, 37.0902],
  CA: [-106.3468, 56.1304],
  Canada: [-106.3468, 56.1304],
  Canadá: [-106.3468, 56.1304],
  MX: [-102.5528, 23.6345],
  Mexico: [-102.5528, 23.6345],
  México: [-102.5528, 23.6345],

  // Europa
  PT: [-8.2245, 39.3999],
  Portugal: [-8.2245, 39.3999],
  ES: [-3.7492, 40.4637],
  Spain: [-3.7492, 40.4637],
  Espanha: [-3.7492, 40.4637],
  FR: [2.2137, 46.2276],
  France: [2.2137, 46.2276],
  França: [2.2137, 46.2276],
  GB: [-3.436, 55.3781],
  UK: [-3.436, 55.3781],
  "United Kingdom": [-3.436, 55.3781],
  "Reino Unido": [-3.436, 55.3781],
  England: [-3.436, 55.3781],
  DE: [10.4515, 51.1657],
  Germany: [10.4515, 51.1657],
  Alemanha: [10.4515, 51.1657],
  IT: [12.5674, 41.8719],
  Italy: [12.5674, 41.8719],
  Itália: [12.5674, 41.8719],
  CH: [8.2275, 46.8182],
  Switzerland: [8.2275, 46.8182],
  Suíça: [8.2275, 46.8182],

  // Ásia e Oceania
  JP: [138.2529, 36.2048],
  Japan: [138.2529, 36.2048],
  Japão: [138.2529, 36.2048],
  CN: [104.1954, 35.8617],
  China: [104.1954, 35.8617],
  IN: [78.9629, 20.5937],
  India: [78.9629, 20.5937],
  Índia: [78.9629, 20.5937],
  AU: [133.7751, -25.2744],
  Australia: [133.7751, -25.2744],
  Austrália: [133.7751, -25.2744],
  NZ: [174.886, -40.9006],
  "New Zealand": [174.886, -40.9006],
  "Nova Zelândia": [174.886, -40.9006],

  // África e Oriente Médio
  ZA: [22.9375, -30.5595],
  "South Africa": [22.9375, -30.5595],
  "África do Sul": [22.9375, -30.5595],
  AE: [53.8478, 23.4241],
  UAE: [53.8478, 23.4241],
  "United Arab Emirates": [53.8478, 23.4241],
  "Emirados Árabes": [53.8478, 23.4241],
  IL: [34.8516, 31.0461],
  Israel: [34.8516, 31.0461],
};

export interface CountrySalesData {
  country: string;
  count: number;
}

interface SalesByCountryMapProps {
  showValues?: boolean;
  chartData?: CountrySalesData[];
}

export default function SalesByCountryMap({
  showValues = true,
  chartData = [],
}: SalesByCountryMapProps) {
  // Estado para controlar qual país foi clicado para abrir o modal
  const [activeCountry, setActiveCountry] = useState<{
    name: string;
    count: number;
    percentage: string;
  } | null>(null);

  // 🔥 2. MOTOR DE DADOS: Processa os dados que vêm do backend
  const { markers, naData, totalSales } = useMemo(() => {
    // Agora usamos estritamente os dados que vêm do Grid!
    const dataToProcess = chartData;

    const total = dataToProcess.reduce(
      (acc, curr) => acc + (curr.count || 0),
      0,
    );

    // Separa o que é N/A
    const naItem = dataToProcess.find(
      (d) => !d.country || d.country === "N/A" || d.country === "Sem país",
    );
    const naCount = naItem ? naItem.count : 0;
    const naPercentage =
      total > 0 ? ((naCount / total) * 100).toFixed(1) : "0.0";

    // Separa os países válidos e prepara os marcadores
    const validCountries = dataToProcess.filter(
      (d) => d.country && d.country !== "N/A" && d.country !== "Sem país",
    );

    const processedMarkers = validCountries
      .map((d) => {
        const coords = COUNTRY_COORDS[d.country] || [0, 0]; // Se não achar, joga no meio do oceano (0,0)
        const percentage =
          total > 0 ? ((d.count / total) * 100).toFixed(1) : "0.0";
        return {
          name: d.country,
          count: d.count,
          percentage,
          coords,
        };
      })
      .filter((m) => m.coords[0] !== 0); // Oculta países que não achamos as coordenadas

    return {
      totalSales: total,
      naData: { count: naCount, percentage: naPercentage },
      markers: processedMarkers,
    };
  }, [chartData]);

  // Fecha o tooltip se clicar fora
  const handleMapClick = () => {
    if (activeCountry) setActiveCountry(null);
  };

  return (
    <div className="relative w-full h-full min-h-[250px] flex items-center justify-center bg-transparent mt-2 overflow-hidden rounded-md">
      {/* MAPA */}
      <ComposableMap
        projectionConfig={{ scale: 210 }}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#334155"
                stroke="#0f172a"
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

        {/* RENDERIZA OS MARCADORES DINÂMICOS */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinates={marker.coords}
            onClick={(e) => {
              e.stopPropagation(); // Evita que o clique feche o modal imediatamente
              setActiveCountry(marker);
            }}
            className="cursor-pointer"
          >
            <circle
              cx={0}
              cy={0}
              r={14}
              fill="#3b82f6"
              opacity={0.2}
              className="animate-pulse"
            />
            <circle cx={0} cy={0} r={5} fill="#3b82f6" />
            <text
              textAnchor="middle"
              y={-16}
              className={cn(
                "fill-white text-[11px] font-bold transition-all duration-300",
                !showValues && "blur-[4px] opacity-70 select-none",
              )}
            >
              {marker.count}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* 🔥 CAIXINHA DE INFO (Esquerda) */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-md border border-border/50 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm pointer-events-none">
        <div className="w-5 h-5 rounded-full border border-blue-500/50 flex items-center justify-center">
          <Info size={10} className="text-blue-500" />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          Clique nos marcadores para ver as métricas
        </span>
      </div>

      {/* 🔥 CAIXINHA N/A (Direita) */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-sm pointer-events-none text-right min-w-[130px]">
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
              {naData.count}
            </span>
          </span>
          <span className="text-blue-500 text-xs font-bold mb-[2px]">
            {naData.percentage}%
          </span>
        </div>
      </div>

      {/* 🔥 MODAL TOOLTIP (Centralizado) */}
      {activeCountry && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e293b]/95 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl shadow-2xl w-48 z-50 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm">
              {activeCountry.name}
            </h3>
            <button
              onClick={() => setActiveCountry(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">
              Total de vendas
            </span>
            <span
              className={cn(
                "text-sm font-bold text-[#3b82f6]",
                !showValues && "blur-[4px] opacity-70",
              )}
            >
              {activeCountry.count}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Participação
            </span>
            <span
              className={cn(
                "text-sm font-bold text-[#3b82f6]",
                !showValues && "blur-[4px] opacity-70",
              )}
            >
              {activeCountry.percentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
