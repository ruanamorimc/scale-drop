"use client";

import React, { useEffect, useState } from "react";
// @ts-ignore
import "funnel-graph-js/dist/css/main.min.css";
// @ts-ignore
import "funnel-graph-js/dist/css/theme.min.css";
import { cn } from "@/lib/utils";

export interface FunnelData {
  clicks?: number;
  pageViews?: number;
  addToCart?: number;
  initiateCheckout?: number;
  vendasIniciadas?: number;
  vendasAprovadas?: number;
}

interface ConversionFunnelChartProps {
  funnelData?: FunnelData;
  isEcommerce?: boolean;
}

export default function ConversionFunnelChart({
  funnelData,
  isEcommerce = true,
}: ConversionFunnelChartProps) {
  const [funnelId] = useState(
    () => `funnel-${Math.random().toString(36).substring(2, 9)}`,
  );

  // 🔥 DETECTOR DE VAZIO
  const rawValues = isEcommerce
    ? [
        funnelData?.clicks || 0,
        funnelData?.pageViews || 0,
        funnelData?.addToCart || 0,
        funnelData?.initiateCheckout || 0,
        funnelData?.vendasIniciadas || 0,
        funnelData?.vendasAprovadas || 0,
      ]
    : [
        funnelData?.clicks || 0,
        funnelData?.pageViews || 0,
        funnelData?.initiateCheckout || 0,
        funnelData?.vendasIniciadas || 0,
        funnelData?.vendasAprovadas || 0,
      ];

  const maxVal = Math.max(...rawValues);
  const isEmpty = maxVal === 0;

  useEffect(() => {
    const containerElement = document.getElementById(funnelId);
    if (!containerElement) return;

    let resizeTimer: NodeJS.Timeout;

    const drawFunnel = async () => {
      try {
        // @ts-ignore
        const FunnelGraphModule = await import("funnel-graph-js");
        const FunnelGraph = FunnelGraphModule.default || FunnelGraphModule;

        const parent = containerElement.parentElement;
        if (!parent) return;

        const w = parent.clientWidth;
        const h = parent.clientHeight;

        if (w < 100 || h < 50) return;

        containerElement.innerHTML = "";

        const currentLabels = isEcommerce
          ? [
              "Cliques",
              "Vis. Página",
              "Adi. Carrinho",
              "ICs",
              "Vendas Inic.",
              "Vendas Apr.",
            ]
          : ["Cliques", "Vis. Página", "ICs", "Vendas Inic.", "Vendas Apr."];

        // Se estiver vazio, joga "1" para a biblioteca não quebrar
        const chartValues = isEmpty ? rawValues.map(() => 1) : rawValues;

        const data = {
          labels: currentLabels,
          colors: ["#4f46e5", "#9333ea", "#db2777"],
          values: chartValues,
        };

        const graph = new FunnelGraph({
          container: `#${funnelId}`,
          gradientDirection: "horizontal",
          data: data,
          displayPercent: true,
          direction: "horizontal",
          width: w,
          height: h,
        });

        graph.draw();

        setTimeout(() => {
          const percents =
            containerElement.querySelectorAll(".label__percentage");
          const textValues = containerElement.querySelectorAll(".label__value");

          percents.forEach((el, i) => {
            if (rawValues[i] !== undefined) {
              el.textContent = isEmpty
                ? "0%"
                : `${Math.round((rawValues[i] / maxVal) * 100)}%`;
            }
          });

          textValues.forEach((el, i) => {
            if (rawValues[i] !== undefined) {
              el.textContent = rawValues[i].toString();
            }
          });
        }, 50);
      } catch (error) {
        console.error("Erro ao renderizar o funnel-graph-js:", error);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawFunnel, 150);
    });

    if (containerElement.parentElement) {
      resizeObserver.observe(containerElement.parentElement);
    }

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [funnelId, isEcommerce, funnelData, isEmpty]); // eslint-disable-line

  return (
    // 🔥 Envolvemos TUDO com a classe is-funnel-empty baseada na variável isEmpty
    <div
      className={cn(
        "flex flex-col h-full w-full relative",
        isEmpty && "is-funnel-empty",
      )}
    >
      <style>{`
        .funnel-container {
          width: 100%;
          height: 100%;
          position: relative;
          box-sizing: border-box;
        }
        
        .svg-funnel-js {
          height: 100% !important;
          padding: 0 !important;
          position: relative;
        }

        /* 🔥 O TRUQUE MAGNÍFICO: Apagamos o SVG inteiro se estiver vazio, deixando só as divs das linhas e textos */
        .is-funnel-empty .svg-funnel-js svg {
          opacity: 0 !important;
          visibility: hidden !important;
        }

        .svg-funnel-js .svg-funnel-js__container {
          height: 100% !important;
          width: 100% !important;
          position: relative !important;
          top: auto !important;
        }
        
        .svg-funnel-js svg {
          width: 100%;
          height: 100%;
          shape-rendering: geometricPrecision;
        }

        .svg-funnel-js .svg-funnel-js__labels {
          position: absolute !important;
          top: -20px;
          bottom: -20px;
          left: 0; right: 0;
          height: auto !important;
          display: flex !important;
          width: 100% !important;
          z-index: 10;
        }

        .svg-funnel-js .svg-funnel-js__label {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          border-left: 1px solid rgba(204, 204, 204, 0.25) !important; 
        }
        .svg-funnel-js .svg-funnel-js__label:first-child { border-left: none !important; }

        .svg-funnel-js .label__title {
          position: absolute;
          top: 5px; 
          font-size: 13px !important;
          font-weight: 600 !important;
          color: hsl(var(--muted-foreground)) !important;
          text-align: center;
          width: 100%;
        }

        .svg-funnel-js .label__percentage {
          font-size: 24px !important;
          font-weight: bold !important;
          color: #ffffff !important;
          text-shadow: #5e5873 0px 0 1px;
        }

        .svg-funnel-js .label__value {
          position: absolute;
          bottom: 5px; 
          font-size: 14px !important;
          font-weight: 600 !important;
          color: hsl(var(--muted-foreground)) !important;
        }

        .svg-funnel-js .svg-funnel-js__subLabels { display: none !important; }
      `}</style>

      <div className="flex-1 w-full h-full relative">
        <div id={funnelId} className="funnel-container" />
      </div>
    </div>
  );
}
