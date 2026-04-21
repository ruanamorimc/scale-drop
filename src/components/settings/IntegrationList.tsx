"use client";

// ==========================================
// IMPORTS
// ==========================================
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ExternalLink,
  ShoppingBag,
  Megaphone,
  Truck,
  LayoutGrid,
  Wallet,
  ShoppingCart,
  Clock,
  Facebook,
  Settings2,
  Unplug,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Server Actions - Desconectar e Conectar
import { connectMercadoLivreAction } from "@/actions/mercadolivre-actions";
import { disconnectYampiIntegration } from "@/actions/yampi-actions";
import { disconnectCartpandaIntegration } from "@/actions/cartpanda-actions";
import { disconnectShopifyIntegration } from "@/actions/shopify-actions"; // 🔥 NOVO IMPORT

// Sheets (Modais Laterais)
import { MetaAssetsSheet } from "./MetaAssetsSheet";
import { YampiSheet } from "./YampiSheet";
import { CartpandaSheet } from "./CartpandaSheet";
import { ShopifySheet } from "./ShopifySheet"; // 🔥 NOVO IMPORT

// ==========================================
// INTERFACES & CONSTANTES
// ==========================================
interface IntegrationsListProps {
  isMLConnected: boolean;
  userId: string;
  isYampiConnected?: boolean;
  yampiUrl?: string | null;
  isCartpandaConnected?: boolean;
  cartpandaUrl?: string | null;
  isShopifyConnected?: boolean; // 🔥 PROPS DA SHOPIFY
  shopifyDomain?: string | null; // 🔥 PROPS DA SHOPIFY
}

const CATEGORIES = [
  { id: "all", label: "Todas", icon: LayoutGrid },
  { id: "loja", label: "Lojas", icon: ShoppingBag },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "gateway", label: "Gateway", icon: Wallet },
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "envio", label: "Envio", icon: Truck },
];

export function IntegrationsList({
  isMLConnected,
  userId,
  isYampiConnected = false,
  yampiUrl = null,
  isCartpandaConnected = false,
  cartpandaUrl = null,
  isShopifyConnected = false, // 🔥
  shopifyDomain = null, // 🔥
}: IntegrationsListProps) {
  // ==========================================
  // ESTADOS DO COMPONENTE
  // ==========================================
  const [activeTab, setActiveTab] = useState("all");

  const [isFbConnected, setIsFbConnected] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("meta_connected_sim") === "true";
    }
    return false;
  });

  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [isYampiModalOpen, setIsYampiModalOpen] = useState(false);
  const [isCartpandaModalOpen, setIsCartpandaModalOpen] = useState(false);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false); // 🔥 ESTADO SHOPIFY

  // ==========================================
  // HANDLERS E FUNÇÕES DE DESCONEXÃO
  // ==========================================
  const handleConnectFacebook = () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/callback/facebook`;
    const scopes = "ads_read,read_insights,ads_management";
    window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${userId}`;
  };

  const handleDisconnectFacebook = () => {
    setIsFbConnected(false);
    localStorage.removeItem("meta_connected_sim");
    toast.error("Conta do Meta desconectada.");
  };

  const handleDisconnectYampi = async () => {
    const res = await disconnectYampiIntegration(userId);
    if (res.success) {
      toast.info("Yampi desconectada com sucesso.");
      setIsYampiModalOpen(false);
    }
  };

  const handleDisconnectCartpanda = async () => {
    const res = await disconnectCartpandaIntegration(userId);
    if (res.success) {
      toast.info("Cartpanda desconectada.");
      setIsCartpandaModalOpen(false);
    }
  };

  // 🔥 Handler da Shopify
  const handleDisconnectShopify = async () => {
    const res = await disconnectShopifyIntegration(userId);
    if (res.success) {
      toast.info("Shopify desconectada com sucesso.");
      setIsShopifyModalOpen(false);
    }
  };

  // ==========================================
  // EFEITOS
  // ==========================================
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("success") === "meta_connected") {
        setIsFbConnected(true);
        localStorage.setItem("meta_connected_sim", "true");
        toast.success("Meta Ads conectado com sucesso!");
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  // ==========================================
  // LISTA COMPLETA DE INTEGRAÇÕES
  // ==========================================
  const integrations = [
    {
      id: "ml",
      name: "Mercado Livre",
      url: "mercadolivre.com.br",
      logoUrl: "/logos/mercadolivre.png",
      description:
        "Importe seus pedidos, sincronize estoque e gerencie etiquetas de envio automaticamente.",
      isConnected: isMLConnected,
      category: "loja",
      isComingSoon: false,
    },
    {
      id: "shopify",
      name: "Shopify",
      url: "shopify.com",
      logoUrl: "/logos/shopify.svg",
      description:
        "A plataforma de comércio global. Sincronize produtos e pedidos em tempo real.",
      isConnected: isShopifyConnected, // 🔥 Dinâmico
      category: "loja",
      isComingSoon: false, // 🔥 Ativado
    },
    {
      id: "nuvemshop",
      name: "Nuvemshop",
      url: "nuvemshop.com.br",
      logoUrl: "/logos/nuvemshop.jpg",
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
      isConnected: isFbConnected,
      category: "marketing",
      isComingSoon: false,
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
    // 🔥 NOVO CARD: SHOPIFY PAYMENTS
    {
      id: "shopify_payments",
      name: "Shopify Payments",
      url: "shopify.com",
      logoUrl: "/logos/shopify.svg",
      description:
        "Checkout nativo e gateway oficial da Shopify. Rastreie vendas locais.",
      isConnected: isShopifyConnected, // Reflete o mesmo status da Shopify Loja
      category: "checkout",
      isComingSoon: false,
    },
    {
      id: "yampi",
      name: "Yampi",
      url: "yampi.com.br",
      logoUrl: "/logos/yampi.svg",
      description:
        "Checkout transparente de alta conversão para dropshipping e e-commerce.",
      isConnected: isYampiConnected,
      category: "checkout",
      isComingSoon: false,
    },
    {
      id: "cartpanda",
      name: "Cartpanda",
      url: "cartpanda.com.br",
      logoUrl: "/logos/cartpanda.png",
      description:
        "Plataforma completa com checkout transparente e recuperação de carrinhos.",
      isConnected: isCartpandaConnected,
      category: "checkout",
      isComingSoon: false,
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

  // ==========================================
  // RENDER DO COMPONENTE
  // ==========================================
  return (
    <>
      <div className="space-y-8 lg:w-[140%] transition-all duration-300">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredList.map((app) => (
            <PremiumCard
              key={app.id}
              className={cn(
                "flex flex-col justify-between h-full transition-all duration-300 shadow-sm hover:border-primary/50 group hover:-translate-y-1 hover:shadow-md",
              )}
            >
              <div className="p-6 space-y-6 flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                      {app.name}
                      {app.isConnected &&
                        (app.id === "facebook" ||
                          app.id === "yampi" ||
                          app.id === "cartpanda" ||
                          app.id === "shopify" ||
                          app.id === "shopify_payments") && (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-500"
                          />
                        )}
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-border/50 p-2 overflow-hidden">
                    {app.logoUrl ? (
                      <Image
                        src={app.logoUrl}
                        alt={app.name}
                        width={40}
                        height={40}
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
                <div className="p-0">
                  <p className="text-sm text-muted-foreground leading-relaxed h-[60px] overflow-hidden text-ellipsis line-clamp-3">
                    {app.description}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-border/50 bg-muted/30 rounded-b-xl transition-colors">
                {app.id === "ml" ? (
                  <form action={connectMercadoLivreAction} className="w-full">
                    {/* Botão ML omitido para brevidade visual, mantenha a lógica igual */}
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
                ) : app.id === "facebook" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsFbModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm"
                      >
                        <Settings2 size={14} /> Configurar Ativos
                      </Button>
                      <Button
                        onClick={handleDisconnectFacebook}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConnectFacebook}
                      className="w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm bg-[#1877F2] hover:bg-[#1877F2]/90 text-white transition-all"
                    >
                      <Facebook
                        size={14}
                        fill="currentColor"
                        className="stroke-none"
                      />{" "}
                      Conectar Meta Ads
                    </Button>
                  )
                ) : app.id === "yampi" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsYampiModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectYampi}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsYampiModalOpen(true)}
                      className="w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      <Settings2 size={14} /> Configurar Webhook
                    </Button>
                  )
                ) : app.id === "cartpanda" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsCartpandaModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectCartpanda}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsCartpandaModalOpen(true)}
                      className="w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      <Settings2 size={14} /> Configurar Webhook
                    </Button>
                  )
                ) : app.id === "shopify" || app.id === "shopify_payments" ? (
                  // 🔥 LÓGICA DA SHOPIFY (Serve tanto para Loja quanto para o Checkout Nativo)
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsShopifyModalOpen(true)}
                        className="flex-1 bg-[#95BF47] hover:bg-[#82a83e] text-white gap-2 h-10 text-xs shadow-sm font-medium"
                      >
                        <Settings2 size={14} /> Ver Loja
                      </Button>
                      <Button
                        onClick={handleDisconnectShopify}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsShopifyModalOpen(true)}
                      className="w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      <Settings2 size={14} /> Conectar Loja
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() =>
                      !app.isComingSoon &&
                      alert(`Integração com ${app.name} em breve!`)
                    }
                    disabled={app.isComingSoon}
                    variant="default"
                    className={cn(
                      "w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm",
                      app.isComingSoon
                        ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted opacity-70 border border-border/50"
                        : "bg-foreground text-background hover:bg-foreground/90",
                    )}
                  >
                    {app.isComingSoon ? (
                      <>
                        <Clock size={13} className="mr-1" /> Em breve
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-1 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />{" "}
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

      {/* MODAIS AQUI EMBAIXO */}
      <MetaAssetsSheet
        open={isFbModalOpen}
        onOpenChange={setIsFbModalOpen}
        onReconnect={handleConnectFacebook}
        userId={userId}
      />

      <YampiSheet
        open={isYampiModalOpen}
        onOpenChange={setIsYampiModalOpen}
        userId={userId}
        existingUrl={yampiUrl}
      />

      <CartpandaSheet
        open={isCartpandaModalOpen}
        onOpenChange={setIsCartpandaModalOpen}
        userId={userId}
        existingUrl={cartpandaUrl}
      />

      {/* 🔥 NOVO SHEET DA SHOPIFY */}
      <ShopifySheet
        open={isShopifyModalOpen}
        onOpenChange={setIsShopifyModalOpen}
        userId={userId}
        existingStore={shopifyDomain}
      />
    </>
  );
}
