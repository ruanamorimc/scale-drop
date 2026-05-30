import React from "react";
import { Target, Rocket, Lightbulb, Scale, Code2 } from "lucide-react";

export default function SobreNos() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-800 dark:text-zinc-300 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        {/* HEADER DA PÁGINA */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-950 dark:text-white tracking-tight mb-6">
            Conheça nossa missão
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A Scale Drop é a plataforma definitiva que permite visualizar seu{" "}
            <strong className="text-blue-600 dark:text-blue-500 font-semibold">
              lucro em tempo real
            </strong>{" "}
            e centraliza as melhores ferramentas de automação em um único
            ecossistema.
          </p>
        </div>

        {/* GRID DE INFORMAÇÕES (O que é e História) */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <Lightbulb className="text-blue-600 dark:text-blue-500 w-8 h-8 mb-6" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              O que é a Scale Drop?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              É a forma inteligente, escalável e visualmente intuitiva de
              gerenciar suas operações. Centenas de empreendedores utilizam
              nossa infraestrutura todos os dias para organizar seus negócios,
              economizando tempo e dinheiro com uma ferramenta robusta e
              acessível.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
            <Code2 className="text-blue-600 dark:text-blue-500 w-8 h-8 mb-6" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              Uma breve história
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Criada por Ricardo Salomão, analista de sistemas e especialista em
              e-commerce. Frustrado com a complexidade das ferramentas de
              análise do mercado, ele decidiu construir a solução ideal. Hoje,
              somos uma empresa em rápido crescimento, movida por
              desenvolvedores apaixonados construindo o software que nós mesmos
              sempre desejamos ter.
            </p>
          </div>
        </div>

        {/* MISSÃO */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
              <Target className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Nossa Missão
            </h2>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 min-w-[24px]">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 mt-2" />
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Ajudar nossos clientes a descobrir novos caminhos para o sucesso
                usando a plataforma de infraestrutura nº 1 do mercado.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 min-w-[24px]">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 mt-2" />
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Diminuir a complexidade operacional e facilitar o trabalho
                pesado do dia a dia.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 min-w-[24px]">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 mt-2" />
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Fomentar um trabalho ético e de ajuda mútua através do
                crescimento da nossa comunidade.
              </p>
            </li>
          </ul>
        </div>

        {/* MANIFESTO (Card de Destaque) */}
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 dark:bg-[#0a0a0a] border border-zinc-800 dark:border-white/10 p-8 sm:p-12 shadow-2xl">
          {/* Efeito de brilho de fundo no manifesto */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <Scale className="text-blue-500 w-8 h-8" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                O Manifesto
              </h2>
            </div>

            <div className="space-y-6 text-lg text-zinc-300 leading-relaxed font-light">
              <p className="text-xl font-medium text-white">
                Acreditamos no poder de calcular a lucratividade por pedido para
                transformar negócios.
              </p>

              <p>
                Administrar um negócio de comércio eletrônico é, em sua
                essência, tanto uma{" "}
                <strong className="text-white">ciência</strong> quanto uma{" "}
                <strong className="text-white">arte</strong>.
              </p>

              <div className="pl-6 border-l-2 border-blue-500/50 space-y-4 my-8">
                <p>
                  <strong className="text-white font-medium">Há arte</strong> em
                  projetar produtos impecáveis, refinar a sua mensagem e
                  construir uma marca magnética.
                </p>
                <p>
                  <strong className="text-white font-medium">A ciência</strong>{" "}
                  está em definir a precificação exata da sua loja, otimizar
                  gastos com publicidade, reduzir custos de envio e realizar
                  testes implacáveis para melhorar as taxas de conversão.
                </p>
              </div>

              <p>
                Nós acreditamos que qualquer pessoa pode dominar a ciência se
                estiver equipada com as ferramentas certas. A chave para o
                sucesso absoluto no comércio eletrônico é combinar arte e
                ciência e executá-las com perfeição. Empresas que não se
                comprometem com ambas não sobrevivem a longo prazo.
              </p>

              <p>
                Muitas das grandes operações de e-commerce que falharam
                espetacularmente conseguiram executar muito bem a arte e o
                branding, mas{" "}
                <strong className="text-red-400">
                  negligenciaram a ciência
                </strong>
                . E quando você falha na ciência, o seu caixa seca. Você perde a
                capacidade de investir no produto e, invariavelmente, fica para
                trás da concorrência.
              </p>

              <div className="pt-8 mt-8 border-t border-white/10 flex items-center gap-4">
                <Rocket className="text-blue-500 w-6 h-6 flex-shrink-0" />
                <p className="text-xl text-white font-medium">
                  Para alcançar um grande sucesso, você precisa executar os dois
                  em harmonia. A arte é sua. A ciência é a Scale Drop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
