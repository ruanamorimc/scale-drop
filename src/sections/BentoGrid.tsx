"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Image from "next/image";
import createGlobe from "cobe";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Server } from "lucide-react";

// =========================================================
// INTERFACE E COMPONENTE MASTER DE CARD (BentoGridCard)
// =========================================================
interface BentoCardProps {
  title: string;
  description: string;
  iconAnimation: (isHovered: boolean) => ReactNode;
  className?: string;
}

// Este componente gerencia o estado de hover e encapsula a lógica de vidro/brilho
function BentoGridCard({
  title,
  description,
  iconAnimation,
  className,
}: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id="plataforma"
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-[1.25rem] bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 p-1.5 transition-colors h-[23rem]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container Interno */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-white dark:bg-[#111] border border-zinc-100 dark:border-white/5 [transform:translateZ(0)]">
        {/* O Brilho no Fundo Total - Ativado pelo estado isHovered */}
        <Image
          src="/gradient2.webp"
          alt="Glow"
          fill
          className={cn(
            "absolute inset-0 z-0 object-cover blur-md transition-opacity duration-700 ease-out pointer-events-none rounded-xl",
            isHovered ? "opacity-0 dark:opacity-30" : "opacity-0",
          )}
        />

        {/* Conteúdo sobre o Brilho */}
        <div className="relative z-10 flex h-full flex-col">
          {/* ÁREA DO ÍCONE (Fundo transparente) */}
          <div className="flex h-[220px] w-full items-center justify-center bg-zinc-50/30 dark:bg-black/20 overflow-hidden relative">
            {/* Passamos o estado de hover para o componente de animação */}
            {iconAnimation(isHovered)}
          </div>

          {/* ÁREA DO TEXTO (Vidro/Glassmorphism! E alinhado na mesma altura) */}
          <div className="flex flex-1 flex-col gap-1.5 px-4 py-5 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md border-t border-zinc-100 dark:border-white/5 rounded-b-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 6 COMPONENTES DE ANIMAÇÃO DE ÍCONE
// =========================================================

const springTransition = { type: "spring", stiffness: 200, damping: 20 };

// 1. Hub de Integrações
const HubIntegrationAnimation = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="relative flex w-full h-full items-center justify-center overflow-visible">
      {/* Ícone Esquerda (Shopify) */}
      <motion.div
        initial={{ rotate: -15, x: -5, y: 15 }}
        animate={
          isHovered
            ? { rotate: 0, x: -25, y: 0 }
            : { rotate: -15, x: -45, y: 15 }
        }
        transition={springTransition}
        className="absolute left-24 sm:left-24 z-10 flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-4 shadow-xl"
      >
        <img
          src="/logos/shopify.svg"
          alt="Shopify"
          className="h-full w-full object-contain opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
      </motion.div>

      {/* Ícone Direita (Yampi) */}
      <motion.div
        initial={{ rotate: 15, x: 45, y: 15 }}
        animate={
          isHovered ? { rotate: 0, x: 25, y: 0 } : { rotate: 15, x: 45, y: 15 }
        }
        transition={springTransition}
        className="absolute right-24 sm:right-24 z-10 flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#141414] p-4 shadow-xl"
      >
        <img
          src="/logos/yampi.svg"
          alt="Yampi"
          className="h-full w-full object-contain opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        />
      </motion.div>

      {/* Ícone Centro (Scale Drop) - transition-colors resolve o delay */}
      <motion.div
        animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
        transition={springTransition}
        className={cn(
          "relative z-20 flex size-20 sm:size-20 bottom-8 shrink-0 items-center justify-center rounded-lg border-2 bg-zinc-50 dark:bg-[#1a1a1a] p-1 shadow-2xl transition-colors duration-300",
          isHovered
            ? "border-zinc-300 dark:border-zinc-700 border-solid"
            : "border-zinc-300 dark:border-zinc-700 border-dashed",
        )}
      >
        <div className="">
          {/* Ícone de Webhook substituindo o 'S' */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-800 dark:text-white"
          >
            <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
            <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
            <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

// =========================================================
// 2. Atribuição Impecável (Sistema Solar - Bug do Loop Resolvido)
// =========================================================
const AttributionAnimation = ({ isHovered }: { isHovered: boolean }) => {
  // Transições de Loop (Apenas quando o mouse está em cima)
  const orbitHover = { duration: 8, repeat: Infinity, ease: "linear" };
  const orbitSlowHover = { duration: 12, repeat: Infinity, ease: "linear" };

  // Transição de Retorno (Quando o mouse sai, volta para a posição original suavemente sem repetir)
  const resetTransition = { type: "spring", stiffness: 100, damping: 20 };

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* Anéis do Radar reduzidos */}
      <div className="absolute w-[80px] h-[80px] rounded-full border border-zinc-200/50 dark:border-white/5" />
      <div className="absolute w-[130px] h-[130px] rounded-full border border-zinc-200/50 dark:border-white/5" />
      <div className="absolute w-[180px] h-[180px] rounded-full border border-zinc-200/50 dark:border-white/5" />

      {/* Ícone Central (Servidor) */}
      <div className="relative z-20 flex size-10 items-center justify-center rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-[0_0_20px_rgba(79,70,229,0.3)]">
        <Server className="size-4 text-indigo-500" />
      </div>

      {/* ================= ÓRBITA INTERNA (130px) ================= */}
      <motion.div
        animate={isHovered ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={isHovered ? orbitHover : resetTransition} // 🔥 Condicional aplicada aqui
        className="absolute z-10 w-[130px] h-[130px]"
      >
        {/* Shopify - Topo */}
        <motion.div
          animate={isHovered ? { rotate: [0, -360] } : { rotate: 0 }}
          transition={isHovered ? orbitHover : resetTransition} // 🔥 Condicional aplicada aqui
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(150,191,72,0.5)]"
        >
          <img src="/logos/shopify.svg" alt="Shopify" className="size-3" />
        </motion.div>

        {/* Meta - Inferior Direito */}
        <motion.div
          animate={isHovered ? { rotate: [0, -360] } : { rotate: 0 }}
          transition={isHovered ? orbitHover : resetTransition}
          className="absolute bottom-[15%] right-[15%] translate-x-1/2 translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(24,119,242,0.5)]"
        >
          <img src="/logos/facebook.svg" alt="Meta" className="size-3" />
        </motion.div>

        {/* Yampi - Inferior Esquerdo */}
        <motion.div
          animate={isHovered ? { rotate: [0, -360] } : { rotate: 0 }}
          transition={isHovered ? orbitHover : resetTransition}
          className="absolute bottom-[15%] left-[15%] -translate-x-1/2 translate-y-1/2 flex size-6 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(224,43,125,0.5)]"
        >
          <img src="/logos/yampi.svg" alt="Yampi" className="size-3" />
        </motion.div>
      </motion.div>

      {/* ================= ÓRBITA EXTERNA (180px) ================= */}
      <motion.div
        animate={isHovered ? { rotate: [0, -360] } : { rotate: 0 }}
        transition={isHovered ? orbitSlowHover : resetTransition} // 🔥 Condicional aplicada aqui
        className="absolute z-10 w-[180px] h-[180px]"
      >
        {/* Appmax - Inferior Centro */}
        <motion.div
          animate={isHovered ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={isHovered ? orbitSlowHover : resetTransition}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(32,178,170,0.5)]"
        >
          <img src="/logos/appmax.png" alt="Appmax" className="size-4" />
        </motion.div>

        {/* Google Ads - Superior Esquerdo */}
        <motion.div
          animate={isHovered ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={isHovered ? orbitSlowHover : resetTransition}
          className="absolute top-[15%] left-[15%] -translate-x-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(66,133,244,0.5)]"
        >
          <img
            src="/logos/google-ads.svg"
            alt="Google Ads"
            className="size-4"
          />
        </motion.div>

        {/* TikTok - Superior Direito */}
        <motion.div
          animate={isHovered ? { rotate: [0, 360] } : { rotate: 0 }}
          transition={isHovered ? orbitSlowHover : resetTransition}
          className="absolute top-[15%] right-[15%] translate-x-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-[0_0_12px_rgba(255,0,80,0.5)]"
        >
          <img src="/logos/tiktok.svg" alt="TikTok" className="size-4" />
        </motion.div>
      </motion.div>
    </div>
  );
};

// 3. Lucro Real
const ProfitAnimation = ({ isHovered }: { isHovered: boolean }) => {
  const [profit, setProfit] = useState("6.424");
  const duration = 4; // Wave lenta, suave e elegante

  // ========================================================================
  // MATEMÁTICA DA ESTEIRA INFINITA COM CURVAS QUADRÁTICAS (Q)
  // O ciclo se repete perfeitamente a cada 80px no eixo X e 40px no eixo Y.
  // ========================================================================
  const svgLinePath =
    "M 0 150 L 30 150 Q 40 150, 50 140 L 70 120 Q 80 110, 90 110 L 110 110 Q 120 110, 130 100 L 150 80 Q 160 70, 170 70 L 190 70 Q 200 70, 210 60 L 230 40 Q 240 30, 250 30 L 270 30 Q 280 30, 290 20 L 310 0 Q 320 -10, 330 -10 L 350 -10 Q 360 -10, 370 -20 L 390 -40 Q 400 -50, 410 -50";

  // O preenchimento desce até o fundo infinito para não piscar
  const svgFillPath = `${svgLinePath} L 410 200 L 0 200 Z`;

  useEffect(() => {
    if (!isHovered) {
      setProfit("6.424");
      return;
    }

    let startTime = Date.now();
    let animationFrame: number;

    const updateCounter = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = (elapsed % (duration * 1000)) / (duration * 1000);

      const currentVal = 6424 + progress * (15890 - 6424);
      setProfit(Math.floor(currentVal).toLocaleString("pt-BR"));

      animationFrame = requestAnimationFrame(updateCounter);
    };

    animationFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrame);
  }, [isHovered]);

  return (
    <div className="relative flex items-center justify-center w-full h-full text-teal-500 overflow-hidden">
      <svg
        viewBox="0 0 250 150"
        className="absolute inset-0 w-full h-full z-0 overflow-visible"
      >
        <defs>
          <pattern
            id="dotPattern"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="2"
              cy="2"
              r="1.2"
              className="text-zinc-200 dark:text-zinc-800"
              fill="currentColor"
            />
          </pattern>

          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>

          {/* O SEGREDO: A máscara FIXA que corta o gráfico na metade da tela (X=160).
              Como o x inicial é -100 e a largura é 260, o corte exato acontece no X=160 */}
          <clipPath id="cutAtBall">
            <rect x="-100" y="-100" width="260" height="400" />
          </clipPath>
        </defs>

        {/* 1. Fundo Fixo de Bolinhas */}
        <rect width="100%" height="100%" fill="url(#dotPattern)" />

        {/* 2. O GRÁFICO ANIMADO (Envolvido pela Máscara Estática) */}
        <g clipPath="url(#cutAtBall)">
          <motion.g
            animate={isHovered ? { x: [0, -80], y: [0, 40] } : { x: 0, y: 0 }}
            transition={
              isHovered
                ? { duration, ease: "linear", repeat: Infinity }
                : { duration: 0.5 }
            }
          >
            <path d={svgFillPath} fill="url(#chartFill)" />
            <path
              d={svgLinePath}
              fill="none"
              stroke="#14b8a6"
              strokeWidth="1"
              strokeLinecap="round"
              // Removido o strokeLinejoin="round" daqui porque as curvas Bezier (Q) já fazem o arredondamento perfeito!
            />
          </motion.g>
        </g>

        {/* 3. A BOLINHA E A LABEL (Estáticas no eixo X, surfando as ondas exatamente nos pixels calculados) */}
        <motion.g
          // O gráfico varia de 72.5 a 87.5 no eixo Y no ponto X=160.
          animate={isHovered ? { y: [72.5, 87.5, 72.5] } : { y: 72.5 }}
          transition={
            isHovered
              ? { duration, ease: "linear", repeat: Infinity }
              : { type: "spring", stiffness: 100, damping: 20 }
          }
        >
          {/* Balão ancorado perfeitamente no centro da bolinha */}
          <foreignObject
            x="110" // (160 do CX da bolinha - 50 da metade do width)
            y="-45" // Espaço de respiro
            width="100"
            height="40"
            className="overflow-visible pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                isHovered
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.9 }
              }
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-end w-full h-full"
            >
              <div className="bg-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap tracking-wide">
                R$ {profit}
              </div>
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-teal-500" />
            </motion.div>
          </foreignObject>

          {/* O Anel Vazado cravado na ponta do gráfico */}
          <circle
            cx="160" // CORTADO NA MÁSCARA EXATAMENTE AQUI
            cy="0"
            r="4.5"
            stroke="#14b8a6"
            strokeWidth="1"
            className="fill-white dark:fill-[#111]"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// 4. Integração Vapt-Vupt
const IntegrationAnimation = ({ isHovered }: { isHovered: boolean }) => {
  // 4 Níveis de trilhas topográficas (Com mais espaçamento inicial para proteger o raio)
  // staticOffset define a posição onde o feixe de energia "descansa" quando não tem hover
  const rings = [
    {
      w: 85,
      x: 57.5,
      rx: 24,
      dash: "25 150",
      offset: 175,
      dur: 2,
      delay: 0,
      staticOffset: 40,
    },
    {
      w: 120,
      x: 40,
      rx: 34,
      dash: "35 220",
      offset: 255,
      dur: 2.5,
      delay: 0.2,
      staticOffset: 110,
    },
    {
      w: 155,
      x: 22.5,
      rx: 44,
      dash: "45 300",
      offset: 345,
      dur: 3,
      delay: 0.4,
      staticOffset: 70,
    },
    {
      w: 190,
      x: 5,
      rx: 54,
      dash: "55 400",
      offset: 455,
      dur: 3.5,
      delay: 0.6,
      staticOffset: 250,
    },
  ];

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden text-slate-400 dark:text-slate-500">
      <svg
        viewBox="0 0 200 200"
        className="absolute w-[240px] h-[240px] overflow-visible"
      >
        <defs>
          <linearGradient id="boltGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="20%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="1" />
            <stop offset="85%" stopColor="#0f172a" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>

          <filter id="innerShadow">
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite
              operator="out"
              in="SourceGraphic"
              in2="offset-blur"
              result="inverse"
            />
            <feFlood floodColor="white" floodOpacity="0.4" result="color" />
            <feComposite
              operator="in"
              in="color"
              in2="inverse"
              result="shadow"
            />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>

          <radialGradient id="fadeMaskGrad" cx="50%" cy="50%" r="50%">
            <stop offset="20%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fadeMask">
            <rect width="200" height="200" fill="url(#fadeMaskGrad)" />
          </mask>
        </defs>

        <g mask="url(#fadeMask)">
          {rings.map((ring, i) => (
            <g key={i}>
              {/* TRILHO DE FUNDO (Estático, com rotação inclinada para 60 graus) */}
              <rect
                x={ring.x}
                y={ring.x}
                width={ring.w}
                height={ring.w}
                rx={ring.rx}
                transform="rotate(60 100 100)"
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="1"
              />
              {/* ENERGIA (Fragmentos em Standby no dark mode, fluindo no hover) */}
              <motion.rect
                x={ring.x}
                y={ring.x}
                width={ring.w}
                height={ring.w}
                rx={ring.rx}
                transform="rotate(60 100 100)"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={ring.dash}
                animate={
                  isHovered
                    ? {
                        strokeDashoffset: [ring.offset, 0],
                        opacity: [0, 1, 1, 0],
                      }
                    : { strokeDashoffset: ring.staticOffset, opacity: 0.3 }
                }
                transition={
                  isHovered
                    ? {
                        duration: ring.dur,
                        repeat: Infinity,
                        ease: "linear",
                        delay: ring.delay,
                      }
                    : { type: "spring", stiffness: 100, damping: 20 }
                }
              />
            </g>
          ))}
        </g>

        {/* O RAIO CENTRAL */}
        <g transform="translate(90, 88)">
          <motion.g
            animate={isHovered ? { scale: 3.2, y: -2 } : { scale: 3.0, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{ transformOrigin: "8px 12px" }}
          >
            <path
              d="M13 2L3 14h9l-2 8 10-12h-9l2-8z"
              fill="url(#boltGradient)"
              filter="url(#innerShadow)"
              stroke="url(#boltGradient)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </motion.g>
        </g>
      </svg>
    </div>
  );
};

// 5. Rastreio de Pedidos (Cenário do Caminhão)
const TrackingAnimation = ({ isHovered }: { isHovered: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hoverRef = useRef(isHovered);
  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    let phi = 0;
    let reqAnimFrame: number;
    let isIntersecting = false;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 400,
      height: 400,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.06, 0.72, 0.5],
      glowColor: [0.06, 0.72, 0.5],

      // Os Pontos Geográficos
      markers: [
        { location: [-23.5505, -46.6333], size: 0.06 }, // São Paulo
        { location: [40.7128, -74.006], size: 0.04 }, // Nova York
        { location: [51.5074, -0.1278], size: 0.04 }, // Londres
        { location: [35.6895, 139.6917], size: 0.05 }, // Tóquio
        { location: [-33.8688, 151.2093], size: 0.04 }, // Sydney
      ],

      // AS ROTAS DE ENTREGA (Arcs)
      arcs: [
        { from: [-23.5505, -46.6333], to: [40.7128, -74.006] }, // SP -> NY
        { from: [40.7128, -74.006], to: [51.5074, -0.1278] }, // NY -> Londres
        { from: [51.5074, -0.1278], to: [35.6895, 139.6917] }, // Londres -> Tóquio
        { from: [35.6895, 139.6917], to: [-33.8688, 151.2093] }, // Tóquio -> Sydney
      ],
      arcColor: [0.06, 0.72, 0.5], // Mesma cor Emerald dos pontos
      arcWidth: 1.5, // Espessura do arco
      arcHeight: 0.4, // Altura da parábola do arco
    });

    const animate = () => {
      if (!isIntersecting) return;

      phi += hoverRef.current ? 0.015 : 0.003;
      globe.update({ phi });
      reqAnimFrame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          reqAnimFrame = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(reqAnimFrame);
        }
      },
      { threshold: 0 },
    );

    observer.observe(canvasRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(reqAnimFrame);
      globe.destroy();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* A MÁGICA DA BORDA: 
        No modo claro (padrão) a sombra é BRANCA (#ffffff), apagando a mancha preta e mesclando com o card.
        No modo escuro (dark:) a sombra fica escura (#0a0a0a) para mesclar com o card dark.
      */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_40px_#ffffff] dark:shadow-[inset_0_0_40px_#0a0a0a] rounded-xl transition-colors duration-500" />

      <motion.div
        className="flex items-center justify-center w-[200px] h-[200px]"
        animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: 200,
            height: 200,
            contain: "layout paint size",
            opacity: 1,
          }}
        />
      </motion.div>
    </div>
  );
};

// 6. Métricas Precisas
const AnalyticsAnimation = ({ isHovered }: { isHovered: boolean }) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-24 h-20 text-rose-600 dark:text-rose-400">
      <div className="absolute w-20 h-20 rounded-full border border-rose-300 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/20 shadow-inner" />
      <div className="absolute w-px h-20 bg-rose-200 dark:bg-rose-800/30" />
      <div className="absolute w-20 h-px bg-rose-200 dark:bg-rose-800/30" />
      <motion.div
        animate={isHovered ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={
          isHovered
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : { duration: 0.5 }
        }
        className="absolute top-0 w-20 h-10 origin-bottom"
      >
        <div
          className="w-full h-full bg-gradient-to-t from-rose-500/0 to-rose-400 dark:to-rose-500 blur-sm origin-bottom"
          style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
        />
      </motion.div>
      <div className="relative z-10 flex flex-col gap-1 items-center">
        <motion.span
          animate={{
            scale: isHovered ? [1, 1.1, 1] : 1,
            color: isHovered ? "#fff" : "#fb7185",
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs font-mono font-bold tracking-tight text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded shadow"
        >
          ROI: +150%
        </motion.span>
        <motion.span
          animate={{ opacity: isHovered ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
          className="text-[10px] font-mono text-rose-500 dark:text-rose-500"
        >
          ROAS: 5.2x
        </motion.span>
      </div>
    </div>
  );
};

// =========================================================
// COMPONENTE PRINCIPAL (BentoGrid)
// =========================================================
export function BentoGrid() {
  return (
    <section
      id="funcionalidade"
      className="relative mx-auto my-24 flex max-w-7xl flex-col items-center justify-center px-4 sm:px-6 md:mt-32"
    >
      {/* Cabeçalho */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="group relative flex h-9 rounded-full p-px text-xs leading-6 font-semibold text-white shadow-xl shadow-white/5 cursor-default">
          <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-white/0 dark:via-white/40 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          <div className="relative z-10 flex items-center gap-2 rounded-full px-4 py-0.5 ring-1 ring-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-crown text-blue-600 dark:text-white transition-colors duration-300 size-3"
              aria-hidden="true"
            >
              <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
              <path d="M5 21h14"></path>
            </svg>
            <div className="text-sm font-normal whitespace-nowrap text-zinc-900 dark:text-white">
              Funcionalidades
            </div>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white mt-6 mb-4">
          Por que escolher o Scale Drop?
        </h2>

        <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Nós ajudamos donos de e-commerce a escalar suas operações eliminando
          planilhas complexas com micro-interações que comunicam valor
          instantaneamente.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-10">
        <BentoGridCard
          title="Atribuição Impecável"
          description="Rastreio de UTMs perfeito. Descubra exatamente qual campanha trouxe cada venda para o seu bolso."
          iconAnimation={(isHovered) => (
            <AttributionAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-3"
        />

        <BentoGridCard
          title="Hub de Integrações"
          description="Mais de 15 conexões nativas. Pluge Shopify, Pagar.me, Meta Ads e Yampi em 2 cliques."
          iconAnimation={(isHovered) => (
            <HubIntegrationAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-4"
        />

        <BentoGridCard
          title="Lucro Real em Tempo Real"
          description="Nosso sistema abate taxas automaticamente para você ver apenas o dinheiro que realmente sobra."
          iconAnimation={(isHovered) => (
            <ProfitAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-3"
        />

        <BentoGridCard
          title="Integração Vapt-Vupt"
          description="Copie e cole suas chaves de API e comece a rodar no mesmo dia, sem complicações técnicas."
          iconAnimation={(isHovered) => (
            <IntegrationAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-3"
        />

        <BentoGridCard
          title="Rastreio de Pedidos"
          description="Sincronização logística automática. Saiba exatamente onde está cada pacote e reduza os chamados de suporte."
          iconAnimation={(isHovered) => (
            <TrackingAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-3"
        />

        <BentoGridCard
          title="Métricas Precisas"
          description="Visualize ROI, ROAS e Taxa de Aprovação em um painel claro e direto. Decisões baseadas em dados frios."
          iconAnimation={(isHovered) => (
            <AnalyticsAnimation isHovered={isHovered} />
          )}
          className="lg:col-span-4"
        />
      </div>
    </section>
  );
}
