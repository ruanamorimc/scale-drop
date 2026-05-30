"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, X, Zap } from "lucide-react";
import { AnimatedPriceCentavos } from "../../components/Animations";

// =========================================================
// DADOS DOS PLANOS (Com Check/X e Disclaimers)
// =========================================================
const plans = [
  {
    name: "Starter",
    description: "Para quem está validando os primeiros produtos no digital.",
    monthlyPrice: "119.90",
    annualPrice: "99.90",
    isCustom: false,
    buttonText: "Escolher plano",
    highlight: false,
    featuresTitle: "Tudo no plano Grátis:",
    features: [
      { name: "Até 1.000 Vendas Aprovadas / mês", included: true },
      { name: "1 Loja Conectada", included: true },
      { name: "1 Conta de Anúncio", included: true },
      { name: "3 Webhooks", included: true },
      { name: "1 Dashboard", included: true },
      { name: "1 Pixel de Otimização", included: true },
      { name: "Número de WhatsApp", included: false },
      { name: "Regras Programadas", included: false },
      { name: "Suporte Prioritário 24/7", included: false },
    ],
    disclaimers: [
      "* R$ 0,14 por venda extra aprovada",
      "** Disponível apenas em planos maiores",
    ],
  },
  {
    name: "Pro",
    description: "Ideal para operações que buscam escala e taxas competitivas.",
    monthlyPrice: "249.90",
    annualPrice: "199.90",
    isCustom: false,
    buttonText: "Escolher plano",
    highlight: true,
    featuresTitle: "Tudo no plano Starter, mais:",
    features: [
      { name: "Até 2.500 Vendas Aprovadas / mês", included: true },
      { name: "7 Lojas Conectadas", included: true },
      { name: "7 Contas de Anúncio", included: true },
      { name: "7 Webhooks", included: true },
      { name: "7 Dashboards", included: true },
      { name: "7 Pixels de Otimização", included: true },
      { name: "2 Números de WhatsApp", included: true },
      { name: "7 Regras Programadas", included: true },
      { name: "Suporte Prioritário 24/7", included: true },
    ],
    disclaimers: [
      "* R$ 0,12 por venda extra aprovada",
      "** R$ 59,90 por WhatsApp adicional",
    ],
  },
  {
    name: "Enterprise",
    description: "Soluções personalizadas para grandes operações B2B.",
    monthlyPrice: "399.90",
    annualPrice: "319.90",
    isCustom: false,
    buttonText: "Escolher plano",
    highlight: false,
    featuresTitle: "Tudo no plano Pro, mais:",
    features: [
      { name: "Até 5.000 Vendas Aprovadas / mês", included: true },
      { name: "Contas de Anúncio ILIMITADAS", included: true },
      { name: "Webhooks ILIMITADOS", included: true },
      { name: "Dashboards ILIMITADOS", included: true },
      { name: "Pixels de Otimização ILIMITADOS", included: true },
      { name: "3 Números de WhatsApp", included: true },
      { name: "Regras Programadas ILIMITADAS", included: true },
      { name: "Suporte Prioritário 24/7", included: true },
    ],
    disclaimers: [
      "* R$ 0,07 por venda extra aprovada",
      "** R$ 59,90 por WhatsApp adicional",
    ],
  },
];

export function Pricing({ hideHeader = false }: { hideHeader?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  return (
    <section
      id="planos"
      className={`relative mx-auto w-full max-w-[1600px] px-6 sm:px-10 md:px-16 ${
        hideHeader ? "mt-4 mb-16" : "my-24 md:mt-32"
      }`}
    >
      {/* CABEÇALHO */}
      {!hideHeader && (
        <div className="flex flex-col items-center text-center mb-10">
          <div className="group relative flex w-fit h-9 rounded-full p-px text-xs leading-6 font-semibold text-white shadow-xl shadow-white/5 cursor-default mb-6">
            <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-white/0 dark:via-white/40 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
            <div className="relative z-10 flex items-center gap-2 rounded-full px-4 py-0.5 ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-50 dark:bg-white/5">
              <Zap className="lucide lucide-zap size-3 text-blue-600 dark:text-white transition-colors duration-300" />
              <div className="text-sm font-normal whitespace-nowrap text-zinc-900 dark:text-white">
                Planos
              </div>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white mb-4">
            Planos que escalam com seu negócio
          </h2>
          <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Escolha o plano perfeito para suas necessidades e comece a otimizar
            sua operação hoje.
          </p>
        </div>
      )}

      {/* =========================================================
          TOGGLE MENSAL/ANUAL (SEMPRE VISÍVEL)
          ========================================================= */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="relative flex items-center p-1 bg-zinc-100 dark:bg-[#111] rounded-full border border-zinc-200 dark:border-white/5">
          <div
            className="absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-[#222] rounded-full shadow-sm transition-transform duration-300 ease-out"
            style={{
              transform:
                billingCycle === "monthly"
                  ? "translateX(0)"
                  : "translateX(100%)",
            }}
          />
          <button
            onClick={() => setBillingCycle("monthly")}
            className="relative z-10 w-28 py-2 text-sm flex justify-center items-center"
          >
            <motion.span
              animate={{ scale: billingCycle === "monthly" ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`font-medium transition-colors ${billingCycle === "monthly" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Mensal
            </motion.span>
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className="relative z-10 w-28 py-2 text-sm flex justify-center items-center"
          >
            <motion.span
              animate={{ scale: billingCycle === "annual" ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`font-medium transition-colors ${billingCycle === "annual" ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              Anual
            </motion.span>
          </button>
        </div>

        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-indigo-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
          Economize 20% no plano Anual
        </span>
      </div>

      {/* =========================================================
          GRID DE CARDS
          ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch mt-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col p-8 rounded-3xl transition-all duration-300 ${
              plan.highlight
                ? "bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-white/10 shadow-xl md:-translate-y-4"
                : "bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10"
            }`}
          >
            {/* Nome e Badge */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {plan.name}
              </h3>
              {plan.highlight && (
                <span className="text-[10px] uppercase tracking-wider font-bold bg-zinc-900 dark:bg-white text-white dark:text-black px-3 py-1 rounded-full">
                  Mais Popular
                </span>
              )}
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 min-h-[40px]">
              {plan.description}
            </p>

            {/* PREÇO */}
            <div className="flex items-baseline gap-1 mb-2 h-[3.5rem]">
              {!plan.isCustom && (
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  R$
                </span>
              )}
              <span className="text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
                <AnimatedPriceCentavos
                  price={
                    billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.annualPrice
                  }
                />
              </span>
            </div>

            <span className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
              {plan.isCustom
                ? "Faturamento alto"
                : billingCycle === "monthly"
                  ? "por mês"
                  : "por ano"}
            </span>

            {/* BOTÃO COM GLOW CIRÚRGICO */}
            <button
              className={`group relative overflow-hidden w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ease-out mb-8 flex items-center justify-center active:scale-95 ${
                plan.highlight
                  ? "text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] hover:border-blue-400"
                  : "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/10 border border-transparent dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-white/20 hover:shadow-[0_0_15px_2px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.1)] hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-white/10"
              }`}
            >
              {/* EFEITO DE VARREDURA (Luz adaptativa: branca no azul/dark, preta no cinza light) */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out ${
                  plan.highlight
                    ? "via-white/30"
                    : "via-black/10 dark:via-white/20"
                }`}
              />

              {/* TEXTO DO BOTÃO BLINDADO SOBRE O EFEITO */}
              <span className="relative z-10">{plan.buttonText}</span>
            </button>

            {/* LISTA DE FUNCIONALIDADES (Com Check e X dinâmicos) */}
            <div className="flex-1 flex flex-col">
              <span className="text-sm font-medium text-zinc-900 dark:text-white mb-4">
                {plan.featuresTitle}
              </span>
              <div className="flex flex-col gap-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      // Ícone CHECK (Azul/Verde)
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shrink-0">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                    ) : (
                      // Ícone X (Cinza de baixa opacidade)
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 shrink-0">
                        <X className="w-3 h-3" strokeWidth={3} />
                      </div>
                    )}
                    <span
                      className={`text-sm ${feature.included ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600 line-through decoration-zinc-300 dark:decoration-zinc-700"}`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* DISCLAIMERS NO FINAL DO CARD */}
            {plan.disclaimers && (
              <div className="flex flex-col gap-1 mt-8 pt-6 border-t border-zinc-200 dark:border-white/5">
                {plan.disclaimers.map((disclaimer, index) => (
                  <span
                    key={index}
                    className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500"
                  >
                    {disclaimer}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
