"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  ShoppingBag,
  Megaphone,
  Truck,
  LayoutGrid,
  Wallet,
  ShoppingCart,
  Clock, // Ícone do relógio para "Em breve"
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { connectMercadoLivreAction } from "@/actions/mercadolivre-actions";
import { cn } from "@/lib/utils";

interface IntegrationsListProps {
  isMLConnected: boolean;
}

// Categorias para o filtro
const CATEGORIES = [
  { id: "all", label: "Todas", icon: LayoutGrid },
  { id: "loja", label: "Lojas", icon: ShoppingBag },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "gateway", label: "Gateway", icon: Wallet },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "envio", label: "Envio", icon: Truck },
];

export function IntegrationsList({ isMLConnected }: IntegrationsListProps) {
  const [activeTab, setActiveTab] = useState("all");

  // LISTA COMPLETA DE INTEGRAÇÕES
  const integrations = [
    {
      id: "ml",
      name: "Mercado Livre",
      url: "mercadolivre.com.br",
      logoUrl: "/logos/mercadolivre.png", // Prefira SVG
      description:
        "Importe seus pedidos, sincronize estoque e gerencie etiquetas de envio automaticamente.",
      isConnected: isMLConnected,
      category: "loja",
      isComingSoon: false, // JÁ DISPONÍVEL
    },
    {
      id: "shopify",
      name: "Shopify",
      url: "shopify.com",
      logoUrl: "/logos/shopify.svg",
      description:
        "A plataforma de comércio global. Sincronize produtos e pedidos em tempo real.",
      isConnected: false,
      category: "loja",
      isComingSoon: true,
    },
    {
      id: "nuvemshop",
      name: "Nuvemshop",
      url: "nuvemshop.com.br",
      logoUrl: "/logos/nuvemshop.jpg", // Idealmente use .svg ou .png transparente
      description:
        "Plataforma de e-commerce líder na América Latina. Gestão completa da sua loja.",
      isConnected: false,
      category: "loja",
      isComingSoon: true,
      logoClass: "rounded-md",
    },
    {
      id: "facebook",
      name: "Facebook Ads",
      url: "business.facebook.com",
      logoUrl: "/logos/facebook.svg",
      description:
        "Sincronize o pixel e API de conversões para otimizar suas campanhas.",
      isConnected: false,
      category: "marketing",
      isComingSoon: true,
    },
    {
      id: "google",
      name: "Google Ads",
      url: "ads.google.com",
      logoUrl: "/logos/google-ads.svg",
      description:
        "Sincronize o pixel e API de conversões para otimizar suas campanhas de pesquisa.",
      isConnected: false,
      category: "marketing",
      isComingSoon: true,
    },
    {
      id: "tiktok",
      name: "TikTok Ads",
      url: "business.tiktok.com",
      logoUrl: "/logos/tiktok.svg",
      description:
        "Sincronize o pixel e API de conversões para otimizar suas campanhas virais.",
      isConnected: false,
      category: "marketing",
      isComingSoon: true,
    },
    {
      id: "appmax",
      name: "Appmax",
      url: "appmax.com.br",
      logoUrl: "/logos/appmax.png",
      description:
        "Processador de pagamentos focado em maximizar a aprovação de vendas.",
      isConnected: false,
      category: "gateway",
      isComingSoon: true,
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      url: "mercadopago.com.br",
      logoUrl: "/logos/mercadopago.png",
      description:
        "Solução de pagamentos completa do Mercado Livre para sua loja online.",
      isConnected: false,
      category: "gateway",
      isComingSoon: true,
    },
    {
      id: "stripe",
      name: "Stripe",
      url: "stripe.com",
      logoUrl: "/logos/stripe.svg",
      description:
        "Solução de pagamentos completa do Mercado Livre para sua loja online.",
      isConnected: false,
      category: "gateway",
      isComingSoon: true,
    },
    {
      id: "yampi",
      name: "Yampi",
      url: "yampi.com.br",
      logoUrl: "/logos/yampi.svg",
      description:
        "Checkout transparente de alta conversão para dropshipping e e-commerce.",
      isConnected: false,
      category: "checkout",
      isComingSoon: true,
    },
    {
      id: "cartpanda",
      name: "Cartpanda",
      url: "cartpanda.com.br",
      logoUrl: "/logos/cartpanda.png",
      description:
        "Plataforma completa com checkout transparente e recuperação de carrinhos.",
      isConnected: false,
      category: "checkout",
      isComingSoon: true,
      logoClass: "rounded-md",
    },
    {
      id: "kiwify",
      name: "Kiwify",
      url: "kiwify.com.br",
      logoUrl: "/logos/kiwify.webp",
      description:
        "Venda infoprodutos e produtos físicos com checkout otimizado.",
      isConnected: false,
      category: "checkout",
      isComingSoon: true,
    },
    {
      id: "hotmart",
      name: "Hotmart",
      url: "hotmart.com",
      logoUrl: "/logos/hotmart.svg",
      description: "Sistema de gestão para produtos digitais e afiliados.",
      isConnected: false,
      category: "checkout",
      isComingSoon: true,
      // AJUSTE DE TAMANHO ESPECÍFICO PARA A LOGO DA HOTMART
      logoClass: "w-auto h-10",
    },
    {
      id: "kirvano",
      name: "Kirvano",
      url: "kirvano.com.br",
      logoUrl: "/logos/kirvano.png",
      description:
        "Plataforma de vendas focada em alta performance e conversão.",
      isConnected: false,
      category: "checkout",
      isComingSoon: true,
      logoClass: "rounded-md",
    },
    {
      id: "melhor-envio",
      name: "Melhor Envio",
      url: "melhorenvio.com.br",
      logoUrl: "/logos/melhorenvio.png",
      description:
        "Cotação de fretes simultânea em diversas transportadoras com desconto.",
      isConnected: false,
      category: "envio",
      isComingSoon: true,
      logoClass: "rounded-md",
    },
  ];

  const filteredList = integrations.filter(
    (item) => activeTab === "all" || item.category === activeTab,
  );

  return (
    // Truque de expansão lateral (w-140%) para burlar o container pai
    <div className="space-y-8 lg:w-[140%] transition-all duration-300">
      {/* ABAS DE FILTRO */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border/50">
        {CATEGORIES.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all border",
                isActive
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {filteredList.map((app) => (
          <PremiumCard
            key={app.id}
            // Animação hover:-translate-y-1 para subir um pouquinho
            className="flex flex-col justify-between h-full transition-all duration-300 hover:border-primary/50 group hover:-translate-y-1 shadow-sm hover:shadow-md"
          >
            <div className="p-6 space-y-6 flex-1">
              {/* HEADER: Texto Esquerda + Logo Direita */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xl font-bold text-foreground tracking-tight">
                    {app.name}
                  </h3>
                  <a
                    href={`https://${app.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-blue-500 transition-colors uppercase tracking-wider font-medium"
                  >
                    {app.url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* LOGO FLUTUANTE */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-border/50 p-2 overflow-hidden">
                  {app.logoUrl ? (
                    <Image
                      src={app.logoUrl}
                      alt={app.name}
                      width={40}
                      height={40}
                      // Aplica a classe customizada se existir (Hotmart), senão usa o padrão
                      className={cn(
                        "object-contain",
                        app.logoClass || "h-full w-full",
                      )}
                    />
                  ) : (
                    <span className="text-sm font-bold text-foreground">
                      {app.name.substring(0, 2)}
                    </span>
                  )}
                </div>
              </div>

              {/* DESCRIÇÃO */}
              <div className="p-0">
                <p className="text-sm text-muted-foreground leading-relaxed h-[60px] overflow-hidden text-ellipsis line-clamp-3">
                  {app.description}
                </p>
              </div>
            </div>

            {/* RODAPÉ DO CARD */}
            <div className="p-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
              {/* LÓGICA DO MERCADO LIVRE (Única funcional por enquanto) */}
              {app.id === "ml" ? (
                <form action={connectMercadoLivreAction} className="w-full">
                  <Button
                    type="submit"
                    disabled={app.isConnected}
                    variant={app.isConnected ? "outline" : "default"}
                    className={cn(
                      "w-full h-10 gap-2 justify-center transition-all font-medium text-xs rounded-lg shadow-sm",
                      app.isConnected
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 dark:text-emerald-400 cursor-default"
                        : "bg-foreground text-background hover:bg-foreground/90",
                    )}
                  >
                    {app.isConnected ? (
                      <>
                        <div className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        Conectado
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                        Conectar
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                // BOTÃO PARA AS OUTRAS INTEGRAÇÕES (Com "Em breve")
                <Button
                  // Só dispara o alert se NÃO for "Em breve" (no futuro)
                  onClick={() =>
                    !app.isComingSoon &&
                    alert(`Integração com ${app.name} em breve!`)
                  }
                  disabled={app.isComingSoon} // Desabilita o botão
                  variant="default"
                  className={cn(
                    "w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm",
                    app.isComingSoon
                      ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted opacity-70 border border-border/50" // Estilo Desabilitado/Em Breve
                      : "bg-foreground text-background hover:bg-foreground/90", // Estilo Ativo
                  )}
                >
                  {app.isComingSoon ? (
                    <>
                      <Clock size={13} className="mr-1" /> Em breve
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                      Conectar
                    </>
                  )}
                </Button>
              )}
            </div>
          </PremiumCard>
        ))}
      </div>
    </div>
  );
}
