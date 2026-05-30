import { Pricing } from "@/sections/Pricing";
import { Zap } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#050505] text-white pt-20 pb-12 px-4 gap-12">
      
      {/* CABEÇALHO DO REDIRECT */}
      <div className="flex flex-col items-center text-center space-y-5 max-w-2xl mx-auto z-10">
        
        {/* BADGE CENTRALIZADO */}
        <div className="group relative inline-flex">
          {/* Linha de brilho superior */}
          <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-white/0 dark:via-white/40 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-60"></span>
          
          {/* Corpo do badge */}
          <div className="relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5 ring-1 ring-blue-200 dark:ring-white/10 bg-blue-50 dark:bg-white/5 transition-colors duration-300">
            <Zap className="lucide lucide-zap size-3.5 text-blue-600 dark:text-white transition-colors duration-300" />
            <span className="text-sm font-medium whitespace-nowrap text-blue-600 dark:text-white transition-colors duration-300">
              Planos
            </span>
          </div>
          
          {/* Linha de brilho inferior */}
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-60"></span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Escolha seu Plano
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            Você precisa de uma assinatura ativa para acessar o Dashboard.
          </p>
        </div>
      </div>

      {/* CONTAINER DO PRICING */}
      <div className="w-full flex justify-center">
        <Pricing hideHeader={true} />
      </div>
      
    </div>
  );
}