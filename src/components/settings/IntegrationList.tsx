"use client";

// ==========================================
// IMPORTS
// ==========================================
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { PLAN_LIMITS, PlanType } from "@/config/plans";
import {
  ExternalLink,
  ShoppingBag,
  Megaphone,
  Truck,
  LayoutGrid,
  Wallet,
  ShoppingCart,
  Clock,
  Settings2,
  Unplug,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Server Actions
import { disconnectMercadoLivre } from "@/actions/mercadolivre-actions";
import { disconnectYampiIntegration } from "@/actions/yampi-actions";
import { disconnectCartpandaIntegration } from "@/actions/cartpanda-actions";
import {
  disconnectShopifyIntegration,
  disconnectShopifyPaymentsIntegration,
} from "@/actions/shopify-actions";
import { disconnectAppmaxIntegration } from "@/actions/appmax-actions";
import { disconnectPagarmeIntegration } from "@/actions/pagarme-actions";
import { disconnectNuvemshopIntegration } from "@/actions/nuvemshop-actions";

// 🔥 Adicionados getMetaAccounts e getGoogleAccounts para sincronização silenciosa
import { disconnectMetaAds, getMetaAccounts } from "@/actions/meta-actions";
import {
  disconnectGoogleAds,
  getGoogleAccounts,
} from "@/actions/google-actions";

// Sheets & Modais
import { MetaAdsSheet } from "@/components/settings/MetaAdsSheet";
import { GoogleAdsSheet } from "@/components/settings/GoogleAdsSheet";
import { YampiSheet } from "@/components/settings/YampiSheet";
import { CartpandaSheet } from "@/components/settings/CartpandaSheet";
import { ShopifySheet } from "@/components/settings/ShopifySheet";
import { ShopifyPaymentsSheet } from "@/components/settings/ShopifyPaymentsSheet";
import { AppmaxSheet } from "@/components/settings/AppmaxSheet";
import { PagarmeSheet } from "@/components/settings/PagarmeSheet";
import { NuvemshopSheet } from "@/components/settings/NuvemshopSheet";
import { MercadoLivreSheet } from "@/components/settings/MercadoLivreSheet";

// ==========================================
// INTERFACES & CONSTANTES
// ==========================================
interface StoreData {
  id: string;
  storeName: string;
  isActive: boolean;
}

interface IntegrationsListProps {
  isMLConnected: boolean;
  mlStores?: StoreData[];
  userId: string;
  userPlan?: string;
  isMetaConnected?: boolean;
  isGoogleConnected?: boolean;
  isYampiConnected?: boolean;
  yampiUrl?: string | null;
  isCartpandaConnected?: boolean;
  cartpandaUrl?: string | null;
  isShopifyConnected?: boolean;
  shopifyDomain?: string | null;
  isShopifyPaymentsConnected?: boolean;
  shopifyPaymentsUrl?: string | null;
  isAppmaxConnected?: boolean;
  appmaxUrl?: string | null;
  isPagarmeConnected?: boolean;
  pagarmeUrl?: string | null;
  isNuvemshopConnected?: boolean;
  nuvemshopStoreName?: string | null;
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
  isMLConnected = false,
  mlStores = [],
  userId,
  userPlan = "START",
  isMetaConnected = false,
  isGoogleConnected = false,
  isYampiConnected = false,
  yampiUrl = null,
  isCartpandaConnected = false,
  cartpandaUrl = null,
  isShopifyConnected = false,
  shopifyDomain = null,
  isShopifyPaymentsConnected = false,
  shopifyPaymentsUrl = null,
  isAppmaxConnected = false,
  appmaxUrl = null,
  isPagarmeConnected = false,
  pagarmeUrl = null,
  isNuvemshopConnected = false,
  nuvemshopStoreName = null,
}: IntegrationsListProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // ==========================================
  // ESTADOS DO COMPONENTE
  // ==========================================
  const [activeTab, setActiveTab] = useState("all");

  // Estados de Conexão Frontend
  const [isFbConnected, setIsFbConnected] = useState(isMetaConnected);
  const [isGoogleConnectedState, setIsGoogleConnectedState] =
    useState(isGoogleConnected);

  // Controle de Abertura dos Sheets
  const [isMlModalOpen, setIsMlModalOpen] = useState(false);
  const [isFbModalOpen, setIsFbModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isYampiModalOpen, setIsYampiModalOpen] = useState(false);
  const [isCartpandaModalOpen, setIsCartpandaModalOpen] = useState(false);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isShopifyPaymentsModalOpen, setIsShopifyPaymentsModalOpen] =
    useState(false);
  const [isAppmaxModalOpen, setIsAppmaxModalOpen] = useState(false);
  const [isPagarmeModalOpen, setIsPagarmeModalOpen] = useState(false);
  const [isNuvemshopModalOpen, setIsNuvemshopModalOpen] = useState(false);

  // ==========================================
  // SINCRONIZAÇÃO INICIAL E ERRO DO REACT CORRIGIDO
  // ==========================================
  useEffect(() => {
    setIsFbConnected(isMetaConnected);
  }, [isMetaConnected]);

  useEffect(() => {
    setIsGoogleConnectedState(isGoogleConnected);
  }, [isGoogleConnected]);

  // ==========================================
  // LÓGICA DE BLOQUEIO DE PLANO (PAYWALL)
  // ==========================================
  const getIntegrationsLimit = (plan: string) => {
    const p = plan.toUpperCase() as PlanType;
    if (PLAN_LIMITS[p]) return PLAN_LIMITS[p].integrations;
    return PLAN_LIMITS.START.integrations;
  };

  const maxIntegrations = getIntegrationsLimit(userPlan);

  const activeIntegrationsCount = [
    isMLConnected,
    isYampiConnected,
    isCartpandaConnected,
    isShopifyConnected,
    isShopifyPaymentsConnected,
    isAppmaxConnected,
    isPagarmeConnected,
    isNuvemshopConnected,
    isFbConnected,
    isGoogleConnectedState,
  ].filter(Boolean).length;

  const isLimitReached = activeIntegrationsCount >= maxIntegrations;

  const handleConnectionAttempt = (action: () => void) => {
    if (isLimitReached) {
      toast.error("Limite do Plano Atingido", {
        description: `Você atingiu o limite de ${maxIntegrations} integração(ões) ativas. Faça o upgrade para conectar mais lojas ou gateways.`,
        action: {
          label: "Fazer Upgrade",
          onClick: () => router.push("/settings/billing"),
        },
      });
      return;
    }
    action();
  };

  // ==========================================
  // HANDLERS DE DESCONEXÃO (AÇÕES DIRETAS)
  // ==========================================
  const handleDisconnectML = async () => {
    const res = await disconnectMercadoLivre(slug);
    if (res.success) {
      toast.success("Mercado Livre desconectado com sucesso.");
      setIsMlModalOpen(false);
    } else toast.error(res.error || "Erro ao desconectar Mercado Livre.");
  };

  const handleDisconnectMeta = async () => {
    const res = await disconnectMetaAds(userId);
    if (res.success) {
      setIsFbConnected(false);
      setIsFbModalOpen(false);
      toast.success("Meta Ads desconectado com sucesso.");
      router.refresh();
    } else toast.error("Erro ao desconectar a conta do Meta.");
  };

  const handleDisconnectGoogle = async () => {
    const res = await disconnectGoogleAds(userId);
    if (res.success) {
      setIsGoogleConnectedState(false);
      setIsGoogleModalOpen(false);
      toast.success("Google Ads desconectado com sucesso.");
      router.refresh();
    } else toast.error("Erro ao desconectar Google Ads.");
  };

  const handleDisconnectYampi = async () => {
    const res = await disconnectYampiIntegration(userId, slug);
    if (res.success) {
      toast.info("Yampi desconectada com sucesso.");
      setIsYampiModalOpen(false);
    }
  };

  const handleDisconnectCartpanda = async () => {
    const res = await disconnectCartpandaIntegration(userId, slug);
    if (res.success) {
      toast.info("Cartpanda desconectada.");
      setIsCartpandaModalOpen(false);
    }
  };

  const handleDisconnectShopify = async () => {
    const res = await disconnectShopifyIntegration(userId, slug);
    if (res.success) {
      toast.info("Shopify desconectada com sucesso.");
      setIsShopifyModalOpen(false);
    }
  };

  const handleDisconnectShopifyPayments = async () => {
    const res = await disconnectShopifyPaymentsIntegration(userId, slug);
    if (res.success) {
      toast.info("Shopify Payments desconectado com sucesso.");
      setIsShopifyPaymentsModalOpen(false);
    } else toast.error("Erro ao desconectar Shopify Payments.");
  };

  const handleDisconnectAppmax = async () => {
    const res = await disconnectAppmaxIntegration(userId, slug);
    if (res.success) {
      toast.info("Appmax desconectada com sucesso.");
      setIsAppmaxModalOpen(false);
    } else toast.error("Erro ao desconectar Appmax.");
  };

  const handleDisconnectPagarme = async () => {
    const res = await disconnectPagarmeIntegration(userId, slug);
    if (res.success) {
      toast.info("Pagar.me desconectada com sucesso.");
      setIsPagarmeModalOpen(false);
    } else toast.error("Erro ao desconectar Pagar.me.");
  };

  const handleDisconnectNuvemshop = async () => {
    const res = await disconnectNuvemshopIntegration(userId, slug);
    if (res?.success) {
      toast.info("Nuvemshop desconectada com sucesso.");
      setIsNuvemshopModalOpen(false);
    } else toast.error(res?.error || "Erro ao desconectar Nuvemshop.");
  };

  // ==========================================
  // OUVINTES GLOBAIS DE OAUTH (A MÁGICA DA REATIVIDADE)
  // ==========================================
  useEffect(() => {
    let mounted = true;

    // 1. Escuta Mensagens de Popups
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "NUVEMSHOP_OAUTH_SUCCESS") {
        toast.success("Nuvemshop conectada com sucesso!");
        router.refresh();
      }
      if (event.data?.type === "META_OAUTH_SUCCESS") {
        setIsFbConnected(true);
        router.refresh();
      }
      if (event.data?.type === "GOOGLE_OAUTH_SUCCESS") {
        setIsGoogleConnectedState(true);
        router.refresh();
      }
      if (event.data?.type === "GOOGLE_OAUTH_DISCONNECT") {
        setIsGoogleConnectedState(false);
        router.refresh();
      }
    };

    window.addEventListener("message", handleMessage);

    // 2. Escuta Parâmetros de URL (Redirect Direto)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("success") === "meta_connected") {
        setTimeout(() => {
          setIsFbConnected(true);
          toast.success("Meta Ads conectado com sucesso!");
          window.history.replaceState(null, "", window.location.pathname);
        }, 0);
      }

      if (urlParams.get("success") === "google_connected") {
        setTimeout(() => {
          setIsGoogleConnectedState(true);
          toast.success("Google Ads conectado com sucesso!");
          window.history.replaceState(null, "", window.location.pathname);
        }, 0);
      }
    }

    // 🔥 3. SINCRONIZAÇÃO SILENCIOSA (Garante a precisão dos Cards instantaneamente)
    const syncStatus = async () => {
      try {
        const [googleRes, metaRes] = await Promise.all([
          getGoogleAccounts(userId),
          getMetaAccounts(userId),
        ]);

        if (mounted) {
          if (
            googleRes.success &&
            googleRes.data &&
            googleRes.data.length > 0
          ) {
            setIsGoogleConnectedState(true);
          }
          if (metaRes.success && metaRes.data && metaRes.data.length > 0) {
            setIsFbConnected(true);
          }
        }
      } catch (error) {
        console.error("Erro ao sincronizar status das integrações", error);
      }
    };

    syncStatus();

    return () => {
      mounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [userId, router]);

  // ==========================================
  // ARRAY CENTRAL DE APLICATIVOS (CARDS)
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
      isConnected: isShopifyConnected,
      category: "loja",
      isComingSoon: false,
    },
    {
      id: "nuvemshop",
      name: "Nuvemshop",
      url: "nuvemshop.com.br",
      logoUrl: "/logos/nuvemshop.png",
      description:
        "Plataforma de e-commerce líder na América Latina. Gestão completa da sua loja.",
      isConnected: isNuvemshopConnected,
      category: "loja",
      isComingSoon: false,
      logoClass: "rounded-md",
    },
    {
      id: "meta",
      name: "Meta Ads",
      url: "business.facebook.com",
      logoUrl: "/logos/meta.png",
      description:
        "Sincronize o pixel e API de conversões para otimizar suas campanhas.",
      isConnected: isFbConnected,
      category: "marketing",
      logoClass: "scale-[1.4]",
      isComingSoon: false,
    },
    {
      id: "google",
      name: "Google Ads",
      url: "ads.google.com",
      logoUrl: "/logos/google-ads.svg",
      description:
        "Sincronize tags e API de conversões para otimizar suas campanhas de pesquisa.",
      isConnected: isGoogleConnectedState,
      category: "marketing",
      isComingSoon: false,
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
      isConnected: isAppmaxConnected,
      category: "gateway",
      isComingSoon: false,
    },
    {
      id: "pagarme",
      name: "Pagar.me",
      url: "pagarme.com.br",
      logoUrl: "/logos/pagar-me.png",
      description:
        "Processe pagamentos com cartão, boleto e Pix com alta conversão.",
      isConnected: isPagarmeConnected,
      category: "gateway",
      isComingSoon: false,
      logoClass: "rounded-md",
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
        "Gateway internacional robusto para processar pagamentos globais.",
      isConnected: false,
      category: "gateway",
      isComingSoon: true,
    },
    {
      id: "shopify_payments",
      name: "Shopify Payments",
      url: "shopify.com",
      logoUrl: "/logos/shopify.svg",
      description:
        "Checkout nativo e gateway oficial da Shopify. Rastreie vendas locais.",
      isConnected: isShopifyPaymentsConnected,
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
  // INTERFACE
  // ==========================================
  return (
    <>
      <div className="space-y-8 lg:w-[140%] transition-all duration-300">
        {/* FILTROS E CONTADOR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/50">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="flex items-center gap-3 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock
                size={12}
                className={isLimitReached ? "text-red-500" : "text-blue-500"}
              />
              Integrações do Plano:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-sm font-bold",
                  isLimitReached ? "text-red-500" : "text-foreground",
                )}
              >
                {activeIntegrationsCount}
              </span>
              <span className="text-muted-foreground text-xs">/</span>
              <span className="text-sm font-bold text-muted-foreground">
                {maxIntegrations}
              </span>
            </div>
            {isLimitReached && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings/billing")}
                className="h-6 text-[10px] bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 hover:text-blue-600 ml-2"
              >
                Fazer Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* GRID DE CARDS */}
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
                        (app.id === "meta" ||
                          app.id === "google" ||
                          app.id === "yampi" ||
                          app.id === "cartpanda" ||
                          app.id === "shopify" ||
                          app.id === "appmax" ||
                          app.id === "pagarme" ||
                          app.id === "nuvemshop" ||
                          app.id === "ml" ||
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
                  <p className="text-sm text-muted-foreground leading-relaxed h-[65px] overflow-hidden text-ellipsis line-clamp-3">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO DOS CARDS */}
              <div className="p-4 border-t border-border/50 bg-muted/30 rounded-b-xl transition-colors">
                {app.id === "ml" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsMlModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Gerenciar Lojas
                      </Button>
                      <Button
                        onClick={handleDisconnectML}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() => setIsMlModalOpen(true))
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Mercado Livre
                    </Button>
                  )
                ) : app.id === "meta" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsFbModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Configurar Ativos
                      </Button>
                      <Button
                        onClick={handleDisconnectMeta}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() => setIsFbModalOpen(true))
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Meta
                    </Button>
                  )
                ) : app.id === "google" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsGoogleModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Configurar Ativos
                      </Button>
                      <Button
                        onClick={handleDisconnectGoogle}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsGoogleModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Google Ads
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
                      onClick={() =>
                        handleConnectionAttempt(() => setIsYampiModalOpen(true))
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Yampi
                    </Button>
                  )
                ) : app.id === "cartpanda" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsCartpandaModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectCartpanda}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsCartpandaModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Cartpanda
                    </Button>
                  )
                ) : app.id === "appmax" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsAppmaxModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectAppmax}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsAppmaxModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Appmax
                    </Button>
                  )
                ) : app.id === "pagarme" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsPagarmeModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectPagarme}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsPagarmeModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Pagar.me
                    </Button>
                  )
                ) : app.id === "shopify" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsShopifyModalOpen(true)}
                        className="flex-1 bg-[#95BF47] hover:bg-[#82a83e] text-white gap-2 h-10 text-xs shadow-sm font-medium cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Integração
                      </Button>
                      <Button
                        onClick={handleDisconnectShopify}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsShopifyModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Shopify
                    </Button>
                  )
                ) : app.id === "shopify_payments" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsShopifyPaymentsModalOpen(true)}
                        className="flex-1 bg-[#95BF47] hover:bg-[#82a83e] text-white gap-2 h-10 text-xs shadow-sm font-medium cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Webhook
                      </Button>
                      <Button
                        onClick={handleDisconnectShopifyPayments}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsShopifyPaymentsModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Payments
                    </Button>
                  )
                ) : app.id === "nuvemshop" ? (
                  app.isConnected ? (
                    <div className="flex items-center gap-2 w-full animate-in fade-in duration-300">
                      <Button
                        onClick={() => setIsNuvemshopModalOpen(true)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white gap-2 h-10 text-xs shadow-sm cursor-pointer"
                      >
                        <Settings2 size={14} /> Ver Integração
                      </Button>
                      <Button
                        onClick={handleDisconnectNuvemshop}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-red-500/20 text-red-500 hover:bg-red-500/10 shrink-0 transition-colors cursor-pointer"
                      >
                        <Unplug size={14} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnectionAttempt(() =>
                          setIsNuvemshopModalOpen(true),
                        )
                      }
                      className="group relative overflow-hidden w-full h-10 gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <Settings2 size={14} /> Conectar Nuvemshop
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() =>
                      !app.isComingSoon &&
                      toast.info(`Integração com ${app.name} em breve!`)
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

      {/* ========================================== */}
      {/* RENDER DOS MODAIS / SHEETS LATERAIS */}
      {/* ========================================== */}
      <MercadoLivreSheet
        open={isMlModalOpen}
        onOpenChange={setIsMlModalOpen}
        connectedStores={mlStores}
      />
      <MetaAdsSheet
        open={isFbModalOpen}
        onOpenChange={setIsFbModalOpen}
        userId={userId}
      />
      <GoogleAdsSheet
        open={isGoogleModalOpen}
        onOpenChange={setIsGoogleModalOpen}
        userId={userId}
      />
      <YampiSheet
        open={isYampiModalOpen}
        onOpenChange={setIsYampiModalOpen}
        userId={userId}
        existingUrl={yampiUrl}
        workspaceId={slug}
      />
      <CartpandaSheet
        open={isCartpandaModalOpen}
        onOpenChange={setIsCartpandaModalOpen}
        userId={userId}
        existingUrl={cartpandaUrl}
        workspaceId={slug}
      />
      <ShopifySheet
        open={isShopifyModalOpen}
        onOpenChange={setIsShopifyModalOpen}
        userId={userId}
        existingStore={shopifyDomain}
        workspaceId={slug}
      />
      <ShopifyPaymentsSheet
        open={isShopifyPaymentsModalOpen}
        onOpenChange={setIsShopifyPaymentsModalOpen}
        userId={userId}
        existingUrl={shopifyPaymentsUrl}
        workspaceId={slug}
      />
      <AppmaxSheet
        open={isAppmaxModalOpen}
        onOpenChange={setIsAppmaxModalOpen}
        existingUrl={appmaxUrl}
        userId={userId}
        workspaceId={slug}
      />
      <PagarmeSheet
        open={isPagarmeModalOpen}
        onOpenChange={setIsPagarmeModalOpen}
        existingUrl={pagarmeUrl}
        userId={userId}
        workspaceId={slug}
      />
      <NuvemshopSheet
        userId={userId}
        open={isNuvemshopModalOpen}
        onOpenChange={setIsNuvemshopModalOpen}
        isConnected={isNuvemshopConnected}
        storeName={nuvemshopStoreName}
        workspaceId={slug}
      />
    </>
  );
}
