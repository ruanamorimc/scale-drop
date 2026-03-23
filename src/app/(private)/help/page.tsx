"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PlayCircle,
  MessageCircle,
  Users,
  HelpCircle,
  ExternalLink,
  Search,
  BookOpen,
  ChevronRight,
  // Video, // <-- Removido pois não será mais usado no header do modal
  Send,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/cards/PremiumCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- DADOS DOS TUTORIAIS ---
const TUTORIAL_CATEGORIES = [
  {
    id: "facebook",
    title: "Facebook Ads",
    subtitle: "Tutoriais da plataforma",
    logoUrl: "/logos/facebook.svg",
    lessons: [
      { title: "Integrar perfis do Meta Ads", duration: "5 min" },
      { title: "Configurar código de UTMs no Meta Ads", duration: "8 min" },
      { title: "Configurar script de UTMs nas páginas", duration: "12 min" },
    ],
  },
  {
    id: "google",
    title: "Google Ads",
    subtitle: "Tutoriais da plataforma",
    logoUrl: "/logos/google-ads.svg",
    lessons: [
      { title: "Criando conta no Google Ads", duration: "15 min" },
      { title: "Instalando a Tag de Conversão", duration: "10 min" },
    ],
  },
  {
    id: "tiktok",
    title: "TikTok Ads",
    subtitle: "Tutoriais da plataforma",
    logoUrl: "/logos/tiktok.svg",
    lessons: [
      { title: "Configurando Pixel do TikTok", duration: "7 min" },
      { title: "Campanhas de Conversão", duration: "12 min" },
    ],
  },
  {
    id: "geral",
    title: "Configuração Geral",
    subtitle: "Aprenda a automatizar sua operação",
    logoUrl: null,
    icon: BookOpen,
    lessons: [
      { title: "Visão geral da Dashboard", duration: "3 min" },
      { title: "Como exportar relatórios", duration: "2 min" },
    ],
  },
];

// --- DADOS DE SUPORTE ---
const SUPPORT_CHANNELS = [
  {
    id: "whatsapp",
    title: "Suporte WhatsApp",
    subtitle: "Fale com nosso time em tempo real",
    logoUrl: "/logos/whatsapp-logo.png",
    isWhatsapp: true,
    actionText: "Contato",
    actionIcon: Send,
    link: "https://wa.link/3do6uj",
  },
  {
    id: "community",
    title: "Comunidade VIP",
    subtitle: "Networking com outros players",
    logoUrl: "/logos/whatsapp-logo.png",
    actionText: "Entrar",
    actionIcon: ExternalLink,
    link: "#",
  },
  {
    id: "faq",
    title: "Central de Ajuda",
    subtitle: "Artigos e dúvidas frequentes",
    icon: HelpCircle,
    colorClass: "text-zinc-400",
    bgClass: "bg-zinc-800/50",
    actionText: "Ler Artigos",
    actionIcon: BookOpen,
    link: "#",
  },
];

export default function HelpPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<
    (typeof TUTORIAL_CATEGORIES)[0] | null
  >(null);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER DA PÁGINA */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Central de Ajuda
        </h2>
        <p className="text-muted-foreground mt-1 text-base">
          Tutoriais passo a passo e canais de suporte para escalar sua operação.
        </p>
      </div>

      {/* LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* === CARD ESQUERDA: TUTORIAIS (2/3) === */}
        <div className="lg:col-span-2">
          <PremiumCard className="p-0 overflow-hidden border-white/10 bg-zinc-950/40 backdrop-blur-sm">
            {/* Header do Card */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
              <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                <div className="p-2 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
                  <PlayCircle size={20} />{" "}
                  {/* Usei PlayCircle aqui para indicar vídeo */}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Tutoriais em Vídeo
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecione uma plataforma para assistir.
                </p>
              </div>
            </div>

            {/* Lista de Itens */}
            <div className="divide-y divide-white/5">
              {TUTORIAL_CATEGORIES.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  onClick={() => setSelectedTutorial(item)}
                >
                  {/* LOGO NO CARD (Permanece a mesma) */}
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 p-2 shadow-sm">
                    {item.logoUrl ? (
                      <Image
                        src={item.logoUrl}
                        alt={item.title}
                        width={32}
                        height={32}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <item.icon className="text-white" size={20} />
                    )}
                  </div>

                  {/* TEXTOS */}
                  <div className="flex flex-col">
                    <h4 className="text-base font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* BOTÃO */}
                  <div className="ml-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-zinc-900 border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500/50 transition-all text-xs h-8 font-medium gap-2"
                    >
                      Ver tutoriais
                      <ChevronRight size={14} className="opacity-50" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* === CARD DIREITA: SUPORTE (1/3) === */}
        <div className="lg:col-span-1 space-y-6">
          <PremiumCard className="p-0 overflow-hidden border-white/10 bg-zinc-950/40 backdrop-blur-sm">
            {/* Header do Card */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
              <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                <div className="p-2 rounded-full bg-emerald-600 text-white shadow-sm flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Canais de Suporte
                </h3>
                <p className="text-xs text-muted-foreground">
                  Precisa de ajuda humana?
                </p>
              </div>
            </div>

            {/* Lista de Suporte */}
            <div className="divide-y divide-white/5">
              {SUPPORT_CHANNELS.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* ÍCONE OU LOGO (WhatsApp maior) */}
                  <div
                    className={cn(
                      "rounded-lg flex items-center justify-center shrink-0 overflow-hidden",
                      item.isWhatsapp ? "h-11 w-11" : "h-10 w-10",
                      item.bgClass,
                      item.colorClass,
                    )}
                  >
                    {item.logoUrl ? (
                      <Image
                        src={item.logoUrl}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    ) : (
                      <item.icon className="text-white" size={20} />
                    )}
                  </div>

                  {/* TEXTOS */}
                  <div className="flex flex-col min-w-0 mr-2">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* BOTÃO COM ÍCONE */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto shrink-0 h-8 text-[10px] border-white/10 bg-transparent hover:bg-white/5 px-3 gap-2"
                    onClick={() => window.open(item.link, "_blank")}
                  >
                    <item.actionIcon size={12} />
                    {item.actionText}
                  </Button>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Aviso Extra */}
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center">
            <p className="text-xs text-zinc-500">
              Atendimento de Segunda a Sexta, das 09h às 18h.
            </p>
          </div>
        </div>
      </div>

      {/* --- MODAL (DIALOG) --- */}
      <Dialog
        open={!!selectedTutorial}
        onOpenChange={(open) => !open && setSelectedTutorial(null)}
      >
        <DialogContent className="max-w-3xl bg-[#09090b] border-white/10 p-0 gap-0 overflow-hidden shadow-2xl">
          {/* HEADER DO MODAL (CORRIGIDO: MOSTRA A LOGO DA PLATAFORMA) */}
          <DialogHeader className="p-6 border-b border-white/10 bg-zinc-900/30">
            <div className="flex items-center gap-5">
              {selectedTutorial && (
                // Container da Logo (Maior e Dark)
                <div className="h-16 w-16 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 p-3 shadow-sm">
                  {selectedTutorial.logoUrl ? (
                    <Image
                      src={selectedTutorial.logoUrl}
                      alt={selectedTutorial.title}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    // Fallback se não tiver imagem
                    <selectedTutorial.icon className="text-white" size={28} />
                  )}
                </div>
              )}

              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                  {selectedTutorial?.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-base mt-1">
                  Selecione uma aula abaixo para assistir agora.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[500px] p-2">
            <div className="flex flex-col gap-1 p-2">
              {selectedTutorial?.lessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Botão Play Estilizado */}
                    <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <PlayCircle
                        size={20}
                        fill="currentColor"
                        className="opacity-100"
                      />
                    </div>

                    <div className="flex flex-col">
                      <h5 className="font-medium text-foreground text-sm group-hover:text-blue-400 transition-colors">
                        {lesson.title}
                      </h5>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Search size={10} /> Duração: {lesson.duration}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-zinc-800 hover:bg-blue-600 text-white h-8 text-xs border border-white/5 transition-colors gap-2"
                  >
                    <Play size={10} fill="currentColor" /> Assistir
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
