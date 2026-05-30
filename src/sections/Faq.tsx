"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, MessageCircle } from "lucide-react";

// =========================================================
// DADOS DAS PERGUNTAS (Focados em quebrar objeções de B2B)
// =========================================================
const faqs = [
  {
    question: "Quais plataformas estão disponíveis no momento?",
    answer:
      "Atualmente, possuímos integração nativa e em um clique com: Shopify, Mercado Livre, Nuuvemshop, Meta ADS, Google ADS, Tiktok ADS, Yampi, Cartpanda, Shopify Payments, Appmax, Pagar.me. Estamos sempre adicionando novos parceiros ao nosso ecossistema.",
  },
  {
    question: "Como funciona o rastreio de UTMs da plataforma?",
    answer:
      "Utilizamos um sistema de rastreamento proprietário (first-party data) que não depende apenas de cookies de terceiros. Isso garante que você saiba exatamente qual campanha, conjunto e criativo trouxe a venda, mesmo com as restrições do iOS 14+.",
  },
  {
    question: "Existe alguma taxa de fidelidade ou multa de cancelamento?",
    answer:
      "Não. Nós acreditamos na transparência total. Você pode cancelar sua assinatura a qualquer momento, diretamente pelo painel, sem taxas ocultas, burocracia ou multas. Você fica pelo resultado, não por contrato.",
  },
  {
    question: "Vocês auxiliam na migração da minha operação atual?",
    answer:
      "Sim! Para assinantes dos planos Pro e Enterprise, nossa equipe técnica auxilia em toda a transição de dados, parametrização de campanhas e configuração de gateways para garantir que sua operação não pare nem por um minuto.",
  },
  {
    question:
      "Qual a diferença do Scale Drop para os dashboards convencionais?",
    answer:
      "O Scale Drop não é apenas um visualizador de métricas. É uma infraestrutura de controle financeiro e operacional que calcula o seu Lucro Real (já descontando taxas de gateway, estornos e custos de produto), oferecendo uma visão cirúrgica que ferramentas de marketing comuns não possuem.",
  },
  {
    question:
      "Não encontrei minha dúvida aqui, o que fazer?",
    answer:
      "Sem problemas, estamos aqui para te ajudar! Entre em contato conosco pelo WhatsApp (82) 99983-3829 e iremos te ajudar com qualquer dúvida que você tenha.",
  },
];

export function Faq() {
  // Estado para controlar qual pergunta está aberta.
  // 'null' significa que todas estão fechadas.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    // Se clicar na mesma pergunta, fecha. Se clicar em outra, abre a nova.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative mx-auto my-24 w-full max-w-[1600px] px-6 sm:px-10 md:px-16 md:mt-32"
    >
      {/* =========================================================
          CABEÇALHO
          ========================================================= */}
      <div className="flex flex-col items-center text-center mb-16">
        {/* BADGE PADRÃO */}
        <div className="group relative flex w-fit h-9 rounded-full p-px text-xs leading-6 font-semibold text-white shadow-xl shadow-white/5 cursor-default mb-6">
          <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-white/0 dark:via-white/40 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
          <div className="relative z-10 flex items-center gap-2 rounded-full px-4 py-0.5 ring-1 ring-zinc-200 dark:ring-white/10 bg-zinc-50 dark:bg-white/5">
            <MessageCircle className="lucide lucide-message-circle text-blue-600 dark:text-white transition-colors duration-300 size-3" />
            <div className="text-sm font-normal whitespace-nowrap text-zinc-900 dark:text-white">
              FAQ
            </div>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-blue-500/0 via-blue-500/90 to-blue-500/0 dark:from-white/0 dark:via-white/90 dark:to-white/0 transition-opacity duration-500 group-hover:opacity-40"></span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white mb-4">
          Perguntas Frequentes
        </h2>
        <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Tudo o que você precisa saber sobre a nossa infraestrutura. Ainda tem
          dúvidas? Fale com nosso suporte.
        </p>
      </div>

      {/* =========================================================
          LISTA DE PERGUNTAS (ACCORDION)
          Centralizado e com largura controlada para boa leitura
          ========================================================= */}
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`flex flex-col border rounded-2xl transition-colors duration-300 overflow-hidden ${
                isOpen
                  ? "bg-zinc-50 dark:bg-[#111] border-zinc-300 dark:border-white/10"
                  : "bg-transparent border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10"
              }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex items-center justify-between w-full p-6 md:px-8 md:py-6 text-left outline-none"
              >
                <span className="text-base md:text-lg font-medium text-zinc-900 dark:text-zinc-100 pr-4">
                  {faq.question}
                </span>

                {/* Ícone Chevron com animação de rotação */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400"
                >
                  <ChevronDown size={18} />
                </motion.div>
              </button>

              {/* CONTEÚDO DA RESPOSTA (Animação de Altura) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} // Curva suave e rápida
                  >
                    <div className="px-6 pb-6 md:px-8 md:pb-6 text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
