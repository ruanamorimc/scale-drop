"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

// =========================================================
// 1. CAMINHOS CIRÚRGICOS (Baseados no seu print do VS Code)
// =========================================================
const rowOneIntegrations = [
  { name: "Pagar.me", category: "Gateway", logoPath: "/logos/pagar-me.png" },
  { name: "Shopify", category: "Plataforma", logoPath: "/logos/shopify.svg" },
  {
    name: "Mercado Livre",
    category: "Plataforma",
    logoPath: "/logos/mercadolivre.png",
  },
  {
    name: "Facebook Ads",
    category: "Marketing",
    logoPath: "/logos/facebook.svg",
  },
  { name: "Yampi", category: "Checkout", logoPath: "/logos/yampi.svg" },
  { name: "Stripe", category: "Gateway", logoPath: "/logos/stripe.svg" },
  { name: "Cartpanda", category: "Checkout", logoPath: "/logos/cartpanda.png" },
];

const rowTwoIntegrations = [
  { name: "Appmax", category: "Gateway", logoPath: "/logos/appmax.png" },
  {
    name: "Nuvemshop",
    category: "Plataforma",
    logoPath: "/logos/nuvemshop.jpg",
  },
  {
    name: "Google Ads",
    category: "Marketing",
    logoPath: "/logos/google-ads.svg",
  },
  { name: "Hotmart", category: "Plataforma", logoPath: "/logos/hotmart.svg" },
  { name: "Kirvano", category: "Checkout", logoPath: "/logos/kirvano.png" },
  { name: "TikTok Ads", category: "Marketing", logoPath: "/logos/tiktok.svg" },
  {
    name: "Mercado Pago",
    category: "Gateway",
    logoPath: "/logos/mercadopago.png",
  },
];

export function Integrations() {
  const [isRow1Hovered, setIsRow1Hovered] = useState(false);
  const [isRow2Hovered, setIsRow2Hovered] = useState(false);

  // Calibragem da velocidade
  const normalSpeed = 35;
  const slowSpeed = 150; // Câmera lenta no hover

  return (
    <section
      id="integracoes"
      className="relative mx-auto my-24 w-full max-w-[1600px] overflow-hidden md:mt-32"
    >
      {/* CABEÇALHO */}
      <div className="flex flex-col items-center text-center px-6 sm:px-10 md:px-16 mb-12 md:mb-16">
        <div className="group relative flex w-fit h-9 rounded-full p-px text-xs leading-6 font-semibold text-white shadow-xl shadow-white/5 cursor-default mb-6">
          <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-white/0 dark:via-white/40 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          <div className="relative z-10 flex items-center gap-2 rounded-full px-4 py-0.5 ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-50 dark:bg-white/5">
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
              className="lucide lucide-blocks text-blue-600 dark:text-white transition-colors duration-300 size-3"
            >
              <rect width="7" height="7" x="14" y="3" rx="1"></rect>
              <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"></path>
            </svg>
            <div className="text-sm font-normal whitespace-nowrap text-zinc-900 dark:text-white">
              Ecossistema
            </div>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white mb-4 leading-[1.1]">
          Conecta com a sua operação.
        </h2>
        <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Nativo, rápido e sem dores de cabeça. Integre seus gateways,
          plataformas e pixels em poucos cliques.
        </p>
      </div>

      {/* =========================================================
          2. ENGENHARIA ANTI-BUG DO MARQUEE 
          - Movido o gap para o Card (mr-4) para cálculo simétrico perfeito.
          - Ambas as faixas aparecem simultaneamente.
          ========================================================= */}
      <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] flex flex-col gap-4 md:gap-6 py-4 overflow-hidden">
        {/* LINHA 1 - Para a Esquerda */}
        <div
          className="flex w-full overflow-hidden"
          onMouseEnter={() => setIsRow1Hovered(true)}
          onMouseLeave={() => setIsRow1Hovered(false)}
        >
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: isRow1Hovered ? slowSpeed : normalSpeed,
              repeat: Infinity,
            }}
            className="flex w-max"
          >
            {/* Array duplicado para garantir que a esteira nunca acabe */}
            {[...rowOneIntegrations, ...rowOneIntegrations].map(
              (item, index) => (
                <IntegrationCard key={`row1-${index}`} item={item} />
              ),
            )}
          </motion.div>
        </div>

        {/* LINHA 2 - Para a Direita */}
        <div
          className="flex w-full overflow-hidden"
          onMouseEnter={() => setIsRow2Hovered(true)}
          onMouseLeave={() => setIsRow2Hovered(false)}
        >
          <motion.div
            // A animação de -50% para 0% garante que ela já comece preenchendo a tela toda e ande ao contrário
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              ease: "linear",
              duration: isRow2Hovered ? slowSpeed : normalSpeed + 5,
              repeat: Infinity,
            }}
            className="flex w-max"
          >
            {[...rowTwoIntegrations, ...rowTwoIntegrations].map(
              (item, index) => (
                <IntegrationCard key={`row2-${index}`} item={item} />
              ),
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// CARD COM MARGEM DIREITA (A chave para o cálculo simétrico)
// =========================================================
function IntegrationCard({ item }: { item: any }) {
  return (
    // Adicionado mr-4 md:mr-6 aqui ao invés de gap na div pai. Isso tira o bug do salto no final do loop.
    <div className="flex items-center gap-4 w-60 md:w-72 p-3 md:p-4 rounded-2xl bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors shrink-0 group mr-4 md:mr-6">
      <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white/70 dark:bg-black/40 backdrop-blur-sm shadow-inner p-2.5 transition-transform duration-300 group-hover:scale-105">
        <Image
          src={item.logoPath}
          alt={`${item.name} Logo`}
          width={64}
          height={64}
          className="object-contain w-full h-full"
          priority={false}
        />
      </div>

      <div className="flex flex-col">
        <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-500 transition-colors">
          {item.name}
        </h4>
        <span className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
          {item.category}
        </span>
      </div>
    </div>
  );
}
