"use client";

import React, { useEffect, useState } from "react";
import "funnel-graph-js/dist/css/main.min.css";
import "funnel-graph-js/dist/css/theme.min.css";

export default function ConversionFunnelChart() {
  const [funnelId] = useState(
    () => `funnel-${Math.random().toString(36).substring(2, 9)}`,
  );

  // Troque para false para testar o modo Infoproduto
  const isEcommerce = true;

  useEffect(() => {
    const containerElement = document.getElementById(funnelId);
    if (!containerElement) return;

    let resizeTimer: NodeJS.Timeout;

    const drawFunnel = async () => {
      try {
        const FunnelGraphModule = await import("funnel-graph-js");
        const FunnelGraph = FunnelGraphModule.default || FunnelGraphModule;

        const parent = containerElement.parentElement;
        if (!parent) return;

        // Lemos o tamanho total do card
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

        // 🔥 ATENÇÃO AOS DADOS: Quedas muito bruscas (ex: 100 para 6) podem gerar curvas estranhas.
        // A biblioteca tenta suavizar, mas se ficar feio, pode ser necessário "alisar" os dados reais.
        const currentValues = isEcommerce
          ? [100, 85, 50, 30, 10, 5]
          : [100, 80, 45, 15, 5];

        const data = {
          labels: currentLabels,
          colors: ["#4f46e5", "#9333ea", "#db2777"],
          //"#4f46e5", "#115bbd", "#00D4FF"
          values: currentValues,
        };

        const graph = new FunnelGraph({
          container: `#${funnelId}`,
          gradientDirection: "horizontal",
          data: data,
          displayPercent: true,
          direction: "horizontal",
          // Passamos o tamanho total do pai, o CSS cuidará do padding
          width: w,
          height: h,
        });

        graph.draw();

        setTimeout(() => {
          const percents =
            containerElement.querySelectorAll(".label__percentage");
          const textValues = containerElement.querySelectorAll(".label__value");
          const max = Math.max(...currentValues);

          percents.forEach((el, i) => {
            if (currentValues[i] !== undefined) {
              el.textContent = `${Math.round((currentValues[i] / max) * 100)}%`;
            }
          });
          textValues.forEach((el, i) => {
            if (currentValues[i] !== undefined)
              el.textContent = currentValues[i].toString();
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
  }, [funnelId, isEcommerce]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <style>{`
        /* 🔥 SOLUÇÃO ROBUSTA: Usamos padding no container principal */
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

        /* Removemos os hacks antigos que bugavam o SVG */
        .svg-funnel-js .svg-funnel-js__container {
          height: 100% !important;
          width: 100% !important;
          position: relative !important;
          top: auto !important;
        }
        
        .svg-funnel-js svg {
          width: 100%;
          height: 100%;
          /* Garante renderização suave */
          shape-rendering: geometricPrecision;
        }

        /* 🔥 HACK DAS LABELS: Elas precisam ignorar o padding do pai para encostar nas bordas */
        .svg-funnel-js .svg-funnel-js__labels {
          position: absolute !important;
          /* Usamos margens negativas para "furar" o padding de 35px do .funnel-container */
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
          #9896DC
        }
        .svg-funnel-js .svg-funnel-js__label:first-child { border-left: none !important; }

        /* Ajuste fino da posição dos textos */
        .svg-funnel-js .label__title {
          position: absolute;
          top: 5px; /* Um pouco mais perto da borda */
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
          bottom: 5px; /* Um pouco mais perto da borda */
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
