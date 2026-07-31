"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { PLAN_LIMITS, PlanType } from "@/config/plans";
import {
  ArrowLeft,
  Settings2,
  Plus,
  MoreVertical,
  Power,
  Edit,
  Trash2,
  Copy,
  Info,
  X,
  Loader2,
  ShieldCheck,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  getGoogleAuthUrl,
  getGoogleAccounts,
  toggleGoogleAccountStatus,
  getGooglePixels,
  saveGooglePixel,
  deleteGooglePixel,
  toggleGooglePixelStatus,
  getGoogleConversionActions,
} from "@/actions/google-actions";

interface GoogleAdsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

type ConversionAction = {
  id: string;
  name: string;
  type: string;
};

type Pixel = {
  id: string;
  name: string;
  accountId: string;
  pixelIds: string[];
  type: string;
  status: "Ativo" | "Desativado";
  rules?: {
    lead?: { enabled?: string; conversionId?: string };
    addToCart?: { enabled?: string; conversionId?: string };
    initiateCheckout?: {
      enabled?: string;
      detection?: string;
      conversionId?: string;
    };
    purchase?: {
      config?: string;
      value?: string;
      product?: string;
      conversionId?: string;
    };
    ipConfig?: string;
  };
};

type GoogleAccount = {
  id: string;
  accountId: string;
  name: string;
  isActive: boolean;
};

const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <label className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
    {label}
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger type="button">
          <Info
            size={13}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-help"
          />
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-none max-w-[250px] p-2.5 rounded-md shadow-xl z-[9999]">
          <p className="text-xs font-medium leading-relaxed">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </label>
);

export function GoogleAdsSheet({
  open,
  onOpenChange,
  userId,
}: GoogleAdsSheetProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [sheetView, setSheetView] = useState<"main" | "form">("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);

  const [availableConversions, setAvailableConversions] = useState<
    ConversionAction[]
  >([]);
  const [isFetchingConversions, setIsFetchingConversions] = useState(false);

  const [googleProfileName, setGoogleProfileName] = useState("Carregando...");
  const [googleProfileInitials, setGoogleProfileInitials] = useState("--");
  const [userPlan, setUserPlan] = useState("START");

  const getLimitsByPlan = (plan: string) => {
    const p = plan.toUpperCase() as PlanType;
    if (PLAN_LIMITS[p])
      return {
        accounts: PLAN_LIMITS[p].adAccounts,
        pixels: PLAN_LIMITS[p].pixels,
      };
    return { accounts: 1, pixels: 1 };
  };

  const limits = getLimitsByPlan(userPlan);
  const maxAccountsAllowed = limits.accounts;
  const maxPixelsAllowed = limits.pixels;
  const activeAccountsCount = accounts.filter((a) => a.isActive).length;

  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
  const [pixelToDelete, setPixelToDelete] = useState<Pixel | null>(null);
  const [pixelToToggle, setPixelToToggle] = useState<Pixel | null>(null);

  const [pixelName, setPixelName] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [currentPixelInput, setCurrentPixelInput] = useState("");
  const [pixelIdsList, setPixelIdsList] = useState<string[]>([]);

  const [ruleLead, setRuleLead] = useState("Desabilitado");
  const [ruleLeadConversionId, setRuleLeadConversionId] = useState("");

  const [ruleAddToCart, setRuleAddToCart] = useState("Desabilitado");
  const [ruleAddToCartConversionId, setRuleAddToCartConversionId] =
    useState("");

  const [ruleInitiateCheckout, setRuleInitiateCheckout] =
    useState("Desabilitado");
  const [ruleInitiateCheckoutDetection, setRuleInitiateCheckoutDetection] =
    useState("Contém texto");
  const [
    ruleInitiateCheckoutConversionId,
    setRuleInitiateCheckoutConversionId,
  ] = useState("");

  const [rulePurchaseConfig, setRulePurchaseConfig] = useState(
    "Vendas pendentes e aprovadas",
  );
  const [rulePurchaseValue, setRulePurchaseValue] = useState("Valor da venda");
  const [rulePurchaseProduct, setRulePurchaseProduct] = useState("Qualquer");
  const [rulePurchaseConversionId, setRulePurchaseConversionId] = useState("");

  const [ruleIpConfig, setRuleIpConfig] = useState(
    "Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6",
  );

  // ==========================================
  // BUSCA DE DADOS (Type-Safe sem `any` e sem erros)
  // ==========================================
  const fetchData = async () => {
    setIsLoading(true);
    const [pixelsRes, accountsRes] = await Promise.all([
      getGooglePixels(userId),
      getGoogleAccounts(userId),
    ]);

    if (pixelsRes.success && pixelsRes.data) {
      // 🔥 Mapeamento seguro que remove o erro vermelho do TypeScript
      const mappedPixels = (pixelsRes.data as unknown[]).map((item) => {
        const p = item as {
          id: string;
          name: string;
          accountId?: string;
          pixelIds: string[];
          type: string;
          status: string;
          rules: unknown;
        };
        return {
          id: p.id,
          name: p.name,
          accountId: p.accountId || "",
          pixelIds: p.pixelIds,
          type: p.type,
          status: p.status as "Ativo" | "Desativado",
          rules: p.rules as Pixel["rules"],
        };
      });
      setPixels(mappedPixels);
    }

    if (accountsRes.success && accountsRes.data) {
      setAccounts(accountsRes.data as GoogleAccount[]);
      if (accountsRes.profileName)
        setGoogleProfileName(accountsRes.profileName);
      if (accountsRes.profileInitials)
        setGoogleProfileInitials(accountsRes.profileInitials);
      if (accountsRes.userPlan) setUserPlan(accountsRes.userPlan);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open && userId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  // ==========================================
  // OAUTH GOOGLE
  // ==========================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_OAUTH_SUCCESS") {
        toast.success("Google Ads conectado com sucesso!");
        setIsConnecting(false);
        fetchData();
        router.refresh();
      } else if (event.data?.type === "GOOGLE_OAUTH_ERROR") {
        toast.error("Erro ao conectar com o Google Ads.");
        setIsConnecting(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleConnect = async () => {
    setIsConnecting(true);
    const res = await getGoogleAuthUrl(slug);
    if (res.success && res.url) {
      const width = 500,
        height = 650;
      const left = window.innerWidth / 2 - width / 2 + window.screenX;
      const top = window.innerHeight / 2 - height / 2 + window.screenY;
      const popup = window.open(
        res.url,
        "GoogleOAuth",
        `width=${width},height=${height},top=${top},left=${left}`,
      );
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed || popup.closed === undefined) {
          clearInterval(checkPopup);
          setIsConnecting(false);
        }
      }, 1000);
    } else {
      toast.error("Erro ao gerar link de autorização.");
      setIsConnecting(false);
    }
  };

  const handleToggleAccount = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (newStatus && activeAccountsCount >= maxAccountsAllowed) {
      return toast.error(
        `Seu plano permite apenas ${maxAccountsAllowed} contas ativas.`,
      );
    }
    setAccounts(
      accounts.map((acc) =>
        acc.id === id ? { ...acc, isActive: newStatus } : acc,
      ),
    );
    const res = await toggleGoogleAccountStatus(userId, id, newStatus);
    if (!res.success) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === id ? { ...acc, isActive: currentStatus } : acc,
        ),
      );
      toast.error("Erro ao alterar status da conta.");
    }
  };

  const loadConversions = async (accountId: string) => {
    if (!accountId) return;
    setIsFetchingConversions(true);
    const res = await getGoogleConversionActions(userId, accountId);
    if (res.success && res.data) {
      setAvailableConversions(res.data);
    } else {
      toast.error("Erro ao buscar conversões desta conta.");
    }
    setIsFetchingConversions(false);
  };

  useEffect(() => {
    if (selectedAccountId) {
      loadConversions(selectedAccountId);
    } else {
      setAvailableConversions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  // ==========================================
  // CONTROLE DO FORMULÁRIO DE RASTREIO
  // ==========================================
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSheetView("main"), 300);
  };

  const openPixelForm = (pixel?: Pixel) => {
    if (pixel) {
      setEditingPixel(pixel);
      setPixelName(pixel.name);
      setPixelIdsList(pixel.pixelIds);
      setSelectedAccountId(pixel.accountId || "");

      const rules = pixel.rules || {};
      setRuleLead(rules.lead?.enabled || "Desabilitado");
      setRuleLeadConversionId(rules.lead?.conversionId || "");

      setRuleAddToCart(rules.addToCart?.enabled || "Desabilitado");
      setRuleAddToCartConversionId(rules.addToCart?.conversionId || "");

      setRuleInitiateCheckout(rules.initiateCheckout?.enabled || "Habilitado");
      setRuleInitiateCheckoutDetection(
        rules.initiateCheckout?.detection || "Contém texto",
      );
      setRuleInitiateCheckoutConversionId(
        rules.initiateCheckout?.conversionId || "",
      );

      setRulePurchaseConfig(
        rules.purchase?.config || "Vendas pendentes e aprovadas",
      );
      setRulePurchaseValue(rules.purchase?.value || "Valor da venda");
      setRulePurchaseProduct(rules.purchase?.product || "Qualquer");
      setRulePurchaseConversionId(rules.purchase?.conversionId || "");

      setRuleIpConfig(
        rules.ipConfig ||
          "Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6",
      );
    } else {
      if (pixels.length >= maxPixelsAllowed) {
        return toast.error(
          `Seu plano permite apenas ${maxPixelsAllowed} configurações de rastreio.`,
        );
      }
      setEditingPixel(null);
      setPixelName("");
      setPixelIdsList([]);
      setSelectedAccountId("");

      setRuleLead("Desabilitado");
      setRuleLeadConversionId("");
      setRuleAddToCart("Desabilitado");
      setRuleAddToCartConversionId("");
      setRuleInitiateCheckout("Habilitado");
      setRuleInitiateCheckoutDetection("Contém texto");
      setRuleInitiateCheckoutConversionId("");
      setRulePurchaseConfig("Vendas pendentes e aprovadas");
      setRulePurchaseValue("Valor da venda");
      setRulePurchaseProduct("Qualquer");
      setRulePurchaseConversionId("");

      setRuleIpConfig("Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6");
    }
    setSheetView("form");
  };

  const closePixelForm = () => {
    setSheetView("main");
    setEditingPixel(null);
  };

  const addCurrentPixelId = () => {
    const val = currentPixelInput.trim().replace(/,/g, "");
    if (!val) return;
    if (pixelIdsList.includes(val))
      return toast.warning("Este ID já foi adicionado.");
    setPixelIdsList([...pixelIdsList, val]);
    setCurrentPixelInput("");
  };

  const handleAddPixelId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCurrentPixelId();
    }
  };

  const removePixelId = (idToRemove: string) =>
    setPixelIdsList(pixelIdsList.filter((id) => id !== idToRemove));

  const handleSavePixel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixelName) return toast.error("O nome do Rastreio é obrigatório.");
    if (!selectedAccountId)
      return toast.error("Selecione uma Conta de Anúncios do Google.");
    if (pixelIdsList.length === 0)
      return toast.error(
        "Adicione pelo menos um ID Base do Google (Ex: AW-XXX).",
      );

    setIsSaving(true);
    const pixelData = {
      id: editingPixel?.id,
      name: pixelName,
      accountId: selectedAccountId,
      pixelIds: pixelIdsList,
      type: "Google Ads",
      status: editingPixel ? editingPixel.status : "Ativo",
      rules: {
        lead: { enabled: ruleLead, conversionId: ruleLeadConversionId },
        addToCart: {
          enabled: ruleAddToCart,
          conversionId: ruleAddToCartConversionId,
        },
        initiateCheckout: {
          enabled: ruleInitiateCheckout,
          detection: ruleInitiateCheckoutDetection,
          conversionId: ruleInitiateCheckoutConversionId,
        },
        purchase: {
          config: rulePurchaseConfig,
          value: rulePurchaseValue,
          product: rulePurchaseProduct,
          conversionId: rulePurchaseConversionId,
        },
        ipConfig: ruleIpConfig,
      },
    };

    const res = await saveGooglePixel(userId, pixelData);
    if (res.success) {
      toast.success(
        editingPixel
          ? "Configurações atualizadas!"
          : "Novo rastreio criado e ativado!",
      );
      await fetchData();
      closePixelForm();
    } else {
      toast.error(res.error || "Falha ao salvar as configurações.");
    }
    setIsSaving(false);
  };

  const confirmDeletePixel = async () => {
    if (!pixelToDelete) return;
    const res = await deleteGooglePixel(userId, pixelToDelete.id);
    if (res.success) {
      toast.success("Rastreio deletado com sucesso!");
      setPixels(pixels.filter((p) => p.id !== pixelToDelete.id));
    } else toast.error("Erro ao deletar o rastreio.");
    setPixelToDelete(null);
  };

  const confirmTogglePixel = async () => {
    if (!pixelToToggle) return;
    const newStatus = pixelToToggle.status === "Ativo" ? "Desativado" : "Ativo";
    const res = await toggleGooglePixelStatus(
      userId,
      pixelToToggle.id,
      newStatus,
    );
    if (res.success) {
      setPixels(
        pixels.map((p) =>
          p.id === pixelToToggle.id ? { ...p, status: newStatus } : p,
        ),
      );
      toast.info(`Rastreio foi ${newStatus.toLowerCase()}.`);
    } else toast.error("Erro ao alterar o status do rastreio.");
    setPixelToToggle(null);
  };

  const getActiveRulesCount = (rules?: Pixel["rules"]) => {
    if (!rules) return 0;
    return [
      rules.lead?.enabled === "Habilitado",
      rules.addToCart?.enabled === "Habilitado",
      rules.initiateCheckout?.enabled === "Habilitado",
      !!rules.purchase?.conversionId,
    ].filter(Boolean).length;
  };

  const generatedScript = `<script> window.googleIds = ${JSON.stringify(pixelIdsList)}; var a = document.createElement("script"); a.src = "https://cdn.scaledrop.com/g-track.js"; document.head.appendChild(a); </script>`;
  const inputClass =
    "flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all";

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
          <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0 transition-all">
            {sheetView === "main" ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  <Image
                    src="/logos/google-ads.svg"
                    alt="Google Ads"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <SheetTitle className="text-xl">
                    Ativos do Google Ads
                  </SheetTitle>
                  <SheetDescription>
                    Gerencie contas, IDs (AW-XXX) e mapeamento de conversões.
                  </SheetDescription>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={closePixelForm}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-muted/50 hover:bg-muted text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="text-left">
                  <SheetTitle className="text-lg flex items-center gap-2">
                    {editingPixel ? (
                      <Edit size={18} className="text-blue-500" />
                    ) : (
                      <Plus size={18} className="text-blue-500" />
                    )}
                    {editingPixel
                      ? "Editar Configuração"
                      : "Adicionar Configuração"}
                  </SheetTitle>
                  <SheetDescription>
                    Mapeie seus eventos para Ações de Conversão do Google.
                  </SheetDescription>
                </div>
              </div>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-hidden relative">
            <div
              className={cn(
                "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-in-out",
                sheetView === "main" ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <Tabs
                defaultValue="contas"
                className="w-full h-full flex flex-col"
              >
                <div className="px-6 pb-4 border-b border-border/40 bg-background shrink-0">
                  <TabsList className="grid h-12 w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
                    <TabsTrigger value="contas" className="rounded-md">
                      Contas de Anúncio
                    </TabsTrigger>
                    <TabsTrigger value="pixels" className="rounded-md">
                      Rastreio e Etiquetas
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="contas"
                  className="flex-1 overflow-y-auto p-6 space-y-6 mt-0 outline-none custom-scrollbar"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p className="text-sm">
                        Sincronizando contas com o Google...
                      </p>
                    </div>
                  ) : (
                    <>
                      {accounts.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                          <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                            <ShieldCheck size={16} /> Quer conectar uma conta
                            diferente?
                          </p>
                          <p className="text-xs text-amber-500/80 mt-1">
                            Certifique-se de escolher o Gmail correto na tela de
                            autorização ao clicar em Reconectar.
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          Perfil Conectado
                        </h4>
                        <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-card">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                              <span className="text-muted-foreground font-bold">
                                {accounts.length > 0
                                  ? googleProfileInitials
                                  : "GO"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {accounts.length > 0
                                  ? googleProfileName
                                  : "Sua Conta Google"}
                              </span>
                              <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                                Token{" "}
                                {accounts.length > 0 ? "Ativo" : "Pendente"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="h-8 text-xs hover:bg-muted min-w-[100px] cursor-pointer"
                          >
                            {isConnecting ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "Reconectar"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">
                            Contas de Anúncio
                          </h4>
                          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
                              {userPlan}
                            </span>
                            <div className="w-px h-3 bg-blue-500/30"></div>
                            <span className="text-[10px] font-medium text-foreground">
                              <strong>{activeAccountsCount}</strong>/
                              {maxAccountsAllowed} ativas
                            </span>
                          </div>
                        </div>

                        {accounts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 border border-dashed border-border/60 rounded-xl bg-muted/10">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                              <Settings2 size={24} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">
                                Nenhuma Conta Conectada
                              </h4>
                              <p className="text-xs text-muted-foreground max-w-[250px]">
                                Autentique-se com o Google para listarmos suas
                                contas de anúncio.
                              </p>
                            </div>
                            <Button
                              onClick={handleConnect}
                              disabled={isConnecting}
                              className="group relative overflow-hidden text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 text-white cursor-pointer min-w-[140px]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                              {isConnecting ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <>
                                  <LinkIcon size={16} className="mr-2" />{" "}
                                  Conectar Perfil
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-border/60 rounded-xl divide-y divide-border/60 bg-card overflow-y-auto max-h-[350px] custom-scrollbar">
                            {accounts.map((acc) => (
                              <div
                                key={acc.id}
                                className={cn(
                                  "flex items-center justify-between p-4 hover:bg-muted/30 transition-colors",
                                  !acc.isActive && "opacity-60",
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-foreground">
                                    {acc.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono mt-0.5">
                                    ID: {acc.accountId}
                                  </span>
                                </div>
                                <Switch
                                  checked={acc.isActive}
                                  onCheckedChange={() =>
                                    handleToggleAccount(acc.id, acc.isActive)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent
                  value="pixels"
                  className="flex-1 overflow-y-auto p-6 space-y-6 mt-0 outline-none custom-scrollbar"
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p className="text-sm">Buscando configurações...</p>
                    </div>
                  ) : pixels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border border-dashed border-border/60 rounded-xl bg-muted/10">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Settings2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          Nenhum Rastreio Configurado
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-[250px]">
                          Vincule os eventos da sua loja às ações de conversão
                          do Google Ads.
                        </p>
                      </div>
                      <Button
                        onClick={() => openPixelForm()}
                        className="group relative overflow-hidden rounded-md cursor-pointer text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Plus size={16} className="mr-1" /> Criar Configuração
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pixels.map((pixel) => (
                        <div
                          key={pixel.id}
                          className={cn(
                            "flex flex-col border border-border/60 rounded-xl p-4 bg-card shadow-sm transition-all relative",
                            pixel.status === "Desativado" && "opacity-60",
                          )}
                        >
                          <div className="absolute top-4 right-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors">
                                  <MoreVertical size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 bg-popover border-border z-150"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 font-medium"
                                  onClick={() => setPixelToToggle(pixel)}
                                >
                                  <Power size={14} />{" "}
                                  {pixel.status === "Ativo"
                                    ? "Pausar Regras"
                                    : "Ativar Regras"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 font-medium"
                                  onClick={() => openPixelForm(pixel)}
                                >
                                  <Edit size={14} /> Editar Mapeamento
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 focus:text-red-400 focus:bg-red-500/10 font-medium"
                                  onClick={() => setPixelToDelete(pixel)}
                                >
                                  <Trash2 size={14} className="text-red-500" />{" "}
                                  Deletar Configuração
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-3 pr-8">
                            {pixel.name}
                          </h4>
                          <div className="space-y-1 text-xs text-muted-foreground font-medium">
                            <p>
                              Tag Principal:{" "}
                              <span className="font-mono text-foreground/80">
                                {pixel.pixelIds.join(", ")}
                              </span>
                            </p>
                            <p>
                              Eventos Mapeados:{" "}
                              <span className="text-foreground/80">
                                {getActiveRulesCount(pixel.rules)}
                              </span>
                            </p>
                            <p className="flex items-center gap-1.5 pt-1">
                              Status:{" "}
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                                  pixel.status === "Ativo"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-orange-500/10 text-orange-500",
                                )}
                              >
                                {pixel.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => openPixelForm()}
                        className="group relative overflow-hidden px-5 py-2 w-full rounded-lg cursor-pointer text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:scale-105 transition-all"
                      >
                        <Plus size={16} className="mr-1" /> Adicionar Rastreio
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* FOOTER MAIN: APENAS 1 BOTÃO (PADRÃO META) */}
              <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 z-20">
                <Button
                  onClick={handleClose}
                  className="group relative overflow-hidden w-full px-5 py-2 rounded-lg cursor-pointer text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  Concluir Configurações
                </Button>
              </div>
            </div>

            {/* ========================================== */}
            {/* VIEW SECUNDÁRIA: FORMULÁRIO DE MAPEAMENTO */}
            {/* ========================================== */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-in-out bg-background",
                sheetView === "form" ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
                  <p className="text-sm text-blue-500 font-medium flex items-center gap-2">
                    <Info size={16} /> Sobre Eventos de Conversão
                  </p>
                  <p className="text-xs text-blue-500/80 mt-1">
                    Para que os eventos abaixo apareçam na lista, você precisa
                    criá-los previamente no painel do Google Ads utilizando a
                    opção <strong>&quot;Importar Cliques&quot;</strong>.
                  </p>
                </div>

                <form
                  id="pixelForm"
                  onSubmit={handleSavePixel}
                  className="space-y-8 pb-8"
                >
                  <div className="space-y-4">
                    <div>
                      <LabelWithTooltip
                        label="Nome"
                        tooltip="Nome interno para você organizar."
                      />
                      <input
                        value={pixelName}
                        onChange={(e) => setPixelName(e.target.value)}
                        placeholder="Ex: Tag Site Principal"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <LabelWithTooltip
                        label="Vincular à Conta Google"
                        tooltip="Qual conta do Google Ads receberá esses dados?"
                      />
                      <div className="relative">
                        <select
                          required
                          value={selectedAccountId}
                          onChange={(e) => setSelectedAccountId(e.target.value)}
                          className={inputClass}
                        >
                          <option value="" disabled>
                            Selecione uma conta...
                          </option>
                          {accounts
                            .filter((a) => a.isActive)
                            .map((acc) => (
                              <option key={acc.id} value={acc.accountId}>
                                {acc.name} ({acc.accountId})
                              </option>
                            ))}
                        </select>
                        {isFetchingConversions && (
                          <div className="absolute right-8 top-1/2 -translate-y-1/2">
                            <RefreshCw
                              size={14}
                              className="animate-spin text-muted-foreground"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/10 p-4 rounded-xl border border-border/50 space-y-3">
                      <LabelWithTooltip
                        label="Tag Global (AW-XXX...)"
                        tooltip="O seu ID principal de rastreamento do Google Ads."
                      />
                      <div className="flex flex-wrap gap-2 mb-2">
                        {pixelIdsList.map((id) => (
                          <div
                            key={id}
                            className="flex items-center gap-1.5 bg-muted text-foreground px-2.5 py-1 rounded-md text-xs font-mono font-medium border border-border"
                          >
                            {id}{" "}
                            <button
                              type="button"
                              onClick={() => removePixelId(id)}
                              className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={currentPixelInput}
                          onChange={(e) => setCurrentPixelInput(e.target.value)}
                          onKeyDown={handleAddPixelId}
                          placeholder="Ex: AW-123456789"
                          className={inputClass}
                        />
                        <Button
                          type="button"
                          onClick={addCurrentPixelId}
                          variant="secondary"
                          className="h-10"
                        >
                          Adicionar <Plus size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* 🔥 UTILIZAÇÃO CORRETA DO GENERATED SCRIPT PARA EVITAR ERRO DE UNUSED VAR */}
                    <div className="pt-2">
                      <LabelWithTooltip
                        label="Código da Tag"
                        tooltip="Copie este código e cole dentro da tag <head> de todas as páginas do seu site externo."
                      />
                      <div className="relative group">
                        <input
                          readOnly
                          value={generatedScript}
                          className={cn(
                            inputClass,
                            "pr-10 text-muted-foreground font-mono text-[11px] truncate bg-muted/30 cursor-pointer",
                          )}
                          onClick={() => {
                            navigator.clipboard.writeText(generatedScript);
                            toast.success("Script copiado!");
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedScript);
                            toast.success("Script copiado!");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-border/50"></div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Conversões de Lead
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Envio de Lead"
                          tooltip="Dispara evento quando um lead é gerado."
                        />
                        <select
                          value={ruleLead}
                          onChange={(e) => setRuleLead(e.target.value)}
                          className={inputClass}
                        >
                          <option value="Desabilitado">Desabilitado</option>
                          <option value="Habilitado">Habilitado</option>
                        </select>
                      </div>
                      {ruleLead === "Habilitado" && (
                        <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-muted/20 border border-border/50 rounded-lg">
                          <LabelWithTooltip
                            label="Evento de Conversão do Google"
                            tooltip="Selecione a ação de conversão criada no Google Ads."
                          />
                          <select
                            value={ruleLeadConversionId}
                            onChange={(e) =>
                              setRuleLeadConversionId(e.target.value)
                            }
                            className={inputClass}
                            required
                          >
                            <option value="">Selecione uma opção</option>
                            {availableConversions.map((conv) => (
                              <option key={conv.id} value={conv.id}>
                                {conv.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Conversões de Initiate Checkout
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Envio de Initiate Checkout"
                          tooltip="Dispara quando o cliente inicia o checkout."
                        />
                        <select
                          value={ruleInitiateCheckout}
                          onChange={(e) =>
                            setRuleInitiateCheckout(e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="Desabilitado">Desabilitado</option>
                          <option value="Habilitado">Habilitado</option>
                        </select>
                      </div>
                      {ruleInitiateCheckout === "Habilitado" && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-4 p-3 bg-muted/20 border border-border/50 rounded-lg">
                          <div>
                            <LabelWithTooltip
                              label="Evento de Conversão do Google"
                              tooltip="Selecione a ação criada no Google Ads."
                            />
                            <select
                              value={ruleInitiateCheckoutConversionId}
                              onChange={(e) =>
                                setRuleInitiateCheckoutConversionId(
                                  e.target.value,
                                )
                              }
                              className={inputClass}
                              required
                            >
                              <option value="">Selecione uma opção</option>
                              {availableConversions.map((conv) => (
                                <option key={conv.id} value={conv.id}>
                                  {conv.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <LabelWithTooltip
                              label="Regra de Detecção"
                              tooltip="Como saberemos que ele clicou em comprar?"
                            />
                            <select
                              value={ruleInitiateCheckoutDetection}
                              onChange={(e) =>
                                setRuleInitiateCheckoutDetection(e.target.value)
                              }
                              className={inputClass}
                            >
                              <option>Contém texto</option>
                              <option>Contém CSS</option>
                            </select>
                          </div>
                          {ruleInitiateCheckoutDetection === "Contém texto" && (
                            <div>
                              <LabelWithTooltip
                                label="Marcar se o botão de compra contém"
                                tooltip="O texto exato do seu botão."
                              />
                              <input
                                placeholder="COMPRAR AGORA"
                                className={inputClass}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Conversões de Purchase
                      </h4>
                      <div className="p-3 bg-muted/20 border border-border/50 rounded-lg space-y-4">
                        <div>
                          <LabelWithTooltip
                            label="Evento de Conversão do Google"
                            tooltip="Selecione a ação de compra principal no Google Ads."
                          />
                          <select
                            value={rulePurchaseConversionId}
                            onChange={(e) =>
                              setRulePurchaseConversionId(e.target.value)
                            }
                            className={inputClass}
                            required
                          >
                            <option value="">Selecione uma opção</option>
                            {availableConversions.map((conv) => (
                              <option key={conv.id} value={conv.id}>
                                {conv.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <LabelWithTooltip
                            label="Configuração de envio"
                            tooltip="Se deseja enviar boletos/pix não pagos como conversão."
                          />
                          <select
                            value={rulePurchaseConfig}
                            onChange={(e) =>
                              setRulePurchaseConfig(e.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="Vendas pendentes e aprovadas">
                              Vendas pendentes e aprovadas
                            </option>
                            <option value="Apenas vendas aprovadas">
                              Apenas vendas aprovadas
                            </option>
                          </select>
                        </div>
                        <div>
                          <LabelWithTooltip
                            label="Valor do Envio"
                            tooltip="Envie o valor da venda ou apenas sua comissão."
                          />
                          <select
                            value={rulePurchaseValue}
                            onChange={(e) =>
                              setRulePurchaseValue(e.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="Valor da venda">
                              Valor da venda
                            </option>
                            <option value="Apenas comissão">
                              Apenas comissão
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 z-20">
                <Button
                  variant="outline"
                  disabled={isSaving}
                  onClick={closePixelForm}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  form="pixelForm"
                  className="group relative overflow-hidden px-5 py-2 rounded-md cursor-pointer text-white border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Salvar Mapeamento"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!pixelToDelete}
        onOpenChange={(open) => !open && setPixelToDelete(null)}
      >
        <AlertDialogContent className="bg-card border-border z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 size={18} /> Você tem certeza?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O rastreio deixará de mapear
              eventos para o Google.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePixel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pixelToToggle}
        onOpenChange={(open) => !open && setPixelToToggle(null)}
      >
        <AlertDialogContent className="bg-card border-border z-[120]">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={
                pixelToToggle?.status === "Ativo"
                  ? "text-orange-500"
                  : "text-emerald-500"
              }
            >
              {pixelToToggle?.status === "Ativo"
                ? "Desativar Mapeamento?"
                : "Ativar Mapeamento?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Confirma a alteração no status de envio destas conversões?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTogglePixel}
              className={
                pixelToToggle?.status === "Ativo"
                  ? "bg-orange-500 text-white"
                  : "bg-emerald-500 text-white"
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
