"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, PlayCircle } from "lucide-react";
import { EffectPerCharacter, EffectPerWord } from "../../components/Animations";

export function Hero() {
  return (
    <section className="relative w-full p-4 sm:p-6 md:p-6 flex justify-center">
      {/* AJUSTE 1: CARD MAIS COMPACTO
        - Reduzi o min-h para 38rem (608px) no desktop.
        - Reduzi drasticamente o padding top para pt-16 md:pt-20 (o texto sobe!).
      */}
      <div className="relative w-full max-w-[1600px] max-h-fit min-h-[35rem] md:min-h-[38rem] rounded-[2.5rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-[#0a0a0a]/50 shadow-sm overflow-hidden flex flex-col items-center pt-16 md:pt-20">
        {/* IMAGEM FRACTAL */}
        <div className="absolute inset-0 z-0 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_100%)]">
          <Image
            src="/FractalMaze.webp"
            alt="Fractal Background Pattern"
            fill
            priority
            quality={100}
            className="object-cover object-top opacity-60 dark:opacity-40 blur-[1px]"
          />
        </div>

        {/* GLOWS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen z-0">
          <div className="absolute -top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/60 blur-[80px]" />
        </div>

        {/* =========================================================
            BLOCO DE TEXTOS (Mais apertado)
            ========================================================= */}
        <div className="relative z-10 flex flex-col items-center w-full px-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 shadow-sm text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-5 cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <EffectPerCharacter text="A ferramenta com a maior conversão do mercado" />
            <ChevronRight
              size={14}
              className="text-zinc-400 dark:text-zinc-500"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight text-zinc-950 dark:text-white mb-4 max-w-3xl text-center leading-[1.05]">
            <EffectPerWord text="Escale seu e-commerce com" />
            <br className="hidden md:block" />
            <EffectPerWord
              text="máxima precisão e controle."
              delay={0.5}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-blue-400 dark:to-blue-300"
            />
          </h1>

          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 mb-6 max-w-2xl text-center leading-relaxed">
            <EffectPerWord
              text="Todas as métricas, integrações e rastreios que a sua operação precisa em um único dashboard feito para quem quer faturar mais pagando menos."
              delay={1}
            />
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 w-full sm:w-auto">
            <Link
              href="/register"
              className="group relative overflow-hidden px-7 py-3 rounded-xl border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 flex items-center justify-center"
            >
              {/* Efeito de Varredura de Luz */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

              <span className="relative z-10 text-base font-semibold text-white tracking-wide">
                Começar Agora
              </span>
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/60 dark:bg-[#111]/60 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 px-7 py-3 rounded-xl font-medium hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm"
            >
              <PlayCircle
                size={18}
                className="text-zinc-400 dark:text-zinc-500"
              />
              Ver Vídeo
            </Link>
          </div>
        </div>

        {/* =========================================================
            MOCKUP DASHBOARD
            ========================================================= */}
        {/* AJUSTE 2: MOCKUP CORTADO 
          - Troquei `mt-auto` por `mt-4`. Ele fica logo abaixo dos botões.
          - A altura da dashboard agora é fixa (h-[260px] / h-[360px]) para não esticar a seção. 
          O overflow-hidden da caixa principal se encarrega de cortar a base graciosamente.
        */}
        <div className="relative w-full max-w-5xl px-4 sm:px-8 flex flex-col justify-end mt-4">
          <div className="absolute inset-x-4 sm:inset-x-8 top-12 bottom-0 bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-t-[1.5rem] border-x border-t border-white/60 dark:border-white/10 shadow-2xl -z-10" />

          <div className="relative rounded-t-[1.25rem] border-x border-t border-zinc-200/60 dark:border-white/10 bg-white dark:bg-[#050505] w-full overflow-hidden flex flex-col translate-y-4">
            <div className="h-10 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/80 dark:bg-[#0a0a0a]/80 flex items-center px-4 gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>

            {/* Altura contida. Não empurra mais a página infinitamente para baixo */}
            <div className="w-full h-[260px] sm:h-[360px] bg-zinc-100 dark:bg-[#111] flex items-center justify-center">
              <span className="text-zinc-400 dark:text-zinc-600 text-sm font-medium">
                Sua imagem do dashboard aqui (1920x1080)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
