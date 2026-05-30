"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CreditCard,
  Link as LinkIcon,
  PieChart,
  ArrowRightLeft,
  Store,
  Calculator,
} from "lucide-react";

// =========================================================
// ATUALIZAÇÃO 2: DADOS REFINADOS
// Inseridas as features de Hub (Gateways), Conciliação e Multi-Lojas
// =========================================================
const features = [
  {
    id: 0,
    title: "Dashboard Central",
    description: "Visão consolidada de todas as suas lojas em tempo real.",
    icon: LayoutDashboard,
    imagePlaceholder: "Print da Dashboard Geral (1920x1080)",
    color: "bg-indigo-500",
  },
  {
    id: 1,
    title: "Hub de Integrações", // Novo título!
    description: "Conexão nativa com Pagar.me, Appmax e Shopify.",
    icon: CreditCard,
    imagePlaceholder: "Print da Tela de Gateways (1920x1080)",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Atribuição de UTMs",
    description: "Saiba exatamente qual anúncio trouxe o cliente pagante.",
    icon: LinkIcon,
    imagePlaceholder: "Print da Tela de UTMs/Campanhas (1920x1080)",
    color: "bg-emerald-500",
  },
  {
    id: 3,
    title: "Cálculo de Lucro Real",
    description: "Abatimento automático de taxas e estornos.",
    icon: PieChart,
    imagePlaceholder: "Print do Relatório de Lucro (1920x1080)",
    color: "bg-purple-500",
  },
  {
    id: 4,
    title: "Gestão Multi-Lojas", // Nova Feature!
    description: "Controle todo o seu ecossistema no mesmo painel.",
    icon: Store,
    imagePlaceholder: "Print da Tela de Multi-Lojas (1920x1080)",
    color: "bg-pink-500",
  },
  {
    id: 5,
    title: "Conciliação de Taxas", // Nova Feature!
    description: "Auditoria automática das cobranças de gateways.",
    icon: Calculator,
    imagePlaceholder: "Print da Tela de Taxas (1920x1080)",
    color: "bg-amber-500",
  },
];

export function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // =========================================================
  // FIX 1: O LOOP SEGURO
  // Removi activeIndex das dependências. Usar a função de callback `(current) => ...`
  // já garante que ele tenha o valor mais atualizado sem forçar re-render do useEffect.
  // =========================================================
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        // Log de debug para garantir que o loop está rodando (pode remover depois)
        // console.log("Avançando do índice:", current);
        return (current + 1) % features.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section
      id="funcionalidades"
      className="relative mx-auto w-full max-w-[1600px] px-6 sm:px-10 md:px-16 my-24 md:my-32"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex w-full flex-col items-start gap-12 lg:flex-row lg:gap-16 xl:gap-24">
        {/* =========================================================
            LADO ESQUERDO: MENU
            ========================================================= */}
        <div className="flex w-full flex-shrink-0 flex-col items-start lg:w-72 xl:w-80 pt-4">
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
                className="lucide lucide-crown text-blue-600 dark:text-white transition-colors duration-300 size-3"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
                <path d="M5 21h14"></path>
              </svg>
              <div className="text-sm font-normal whitespace-nowrap text-zinc-900 dark:text-white">
                Componentes
              </div>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-4">
            Explore a Interface do Scale Drop
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed w-full">
            Interaja com os elementos da plataforma desenhados para dar
            velocidade e clareza aos fluxos da sua operação.
          </p>

          <div className="flex flex-col gap-2 relative w-full">
            <motion.div
              className="absolute left-0 w-0.5 bg-indigo-500 rounded-r-full z-10"
              initial={false}
              animate={{ top: `${activeIndex * (48 + 8)}px`, height: "48px" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeIndex === index;

              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveIndex(index)}
                  className={`relative flex items-center gap-4 w-full pl-5 pr-4 h-12 text-left transition-all duration-300 rounded-r-lg rounded-l-sm group ${
                    isActive
                      ? "bg-zinc-100 dark:bg-white/5"
                      : "hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-300 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"}`}
                  >
                    {feature.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            LADO DIREITO: IMAGEM (Bug Corrigido)
            ========================================================= */}
        <div className="w-full flex-1 lg:w-auto min-w-0">
          <div className="relative w-full rounded-2xl md:rounded-[2rem] bg-white dark:bg-[#111] border border-zinc-200/60 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col [transform:translateZ(0)]">
            <div className="h-10 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 flex items-center px-4 gap-1.5 shrink-0 relative z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 dark:bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 dark:bg-green-500/80" />
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 transition-colors duration-1000">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[100px] transition-colors duration-1000 ${features[activeIndex].color}`}
              />
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[16/10] bg-zinc-100 dark:bg-[#050505] overflow-hidden z-10 rounded-b-2xl md:rounded-b-[2rem]">
              {/* FIX 2: mode="wait" garante que o elemento saia totalmente antes do novo entrar, 
                  evitando saltos de tamanho do container. */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  // A classe w-full h-full AQUI é vital para o height não colapsar durante a transição
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                  {/* Você tem uma imagem para o 0, e placeholders para o resto. 
                      Mantive sua lógica, mas blindada em divs do mesmo tamanho. */}
                  {activeIndex === 0 ? (
                    <Image
                      src="/teste.png" // Troque pelo caminho real
                      alt="Dashboard Central"
                      fill
                      className="object-cover object-top"
                      priority // Muito importante para a primeira imagem não piscar
                    />
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-600 text-sm md:text-base font-medium px-6 text-center">
                      {features[activeIndex].imagePlaceholder}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
