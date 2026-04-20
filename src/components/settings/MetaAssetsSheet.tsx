"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 🔥 IMPORT NOVO PARA O REDIRECIONAMENTO
import {
  Facebook,
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
  getMetaPixels,
  saveMetaPixel,
  deleteMetaPixel,
  toggleMetaPixelStatus,
  getMetaAccounts,
  toggleMetaAccountStatus,
} from "@/actions/meta-actions";

interface MetaAssetsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconnect: () => void;
  userId: string;
}

type Pixel = {
  id: string;
  name: string;
  pixelIds: string[];
  type: string;
  status: "Ativo" | "Desativado";
  rules?: any;
};
type MetaAccount = {
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
        <TooltipContent className="bg-popover border-border max-w-[250px]">
          <p className="text-xs font-medium">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </label>
);

export function MetaAssetsSheet({
  open,
  onOpenChange,
  onReconnect,
  userId,
}: MetaAssetsSheetProps) {
  const router = useRouter(); // 🔥 INSTANCIANDO O ROUTER
  const [sheetView, setSheetView] = useState<"main" | "form">("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [accounts, setAccounts] = useState<MetaAccount[]>([]);

  const [metaProfileName, setMetaProfileName] = useState("Carregando...");
  const [metaProfileInitials, setMetaProfileInitials] = useState("--");
  const [userPlan, setUserPlan] = useState("FREE");

  // 🔥 LÓGICA DE LIMITES (Ajuste os nomes dos planos conforme o seu sistema)
  const getLimitsByPlan = (plan: string) => {
    const p = plan.toUpperCase();
    if (p === "PRO" || p === "ENTERPRISE") return { accounts: 10, pixels: 5 };
    if (p === "SCALE") return { accounts: 5, pixels: 3 };
    if (p === "START") return { accounts: 2, pixels: 1 };
    return { accounts: 1, pixels: 1 }; // Fallback caso esteja FREE no banco
  };

  const limits = getLimitsByPlan(userPlan);
  const maxAccountsAllowed = limits.accounts;
  const maxPixelsAllowed = limits.pixels;

  const [editingPixel, setEditingPixel] = useState<Pixel | null>(null);
  const [pixelToDelete, setPixelToDelete] = useState<Pixel | null>(null);
  const [pixelToToggle, setPixelToToggle] = useState<Pixel | null>(null);
  const [pixelName, setPixelName] = useState("");
  const [currentPixelInput, setCurrentPixelInput] = useState("");
  const [pixelIdsList, setPixelIdsList] = useState<string[]>([]);
  const [ruleLead, setRuleLead] = useState("Desabilitado");
  const [ruleAddToCart, setRuleAddToCart] = useState("Desabilitado");
  const [ruleInitiateCheckout, setRuleInitiateCheckout] =
    useState("Habilitado");
  const [ruleInitiateCheckoutDetection, setRuleInitiateCheckoutDetection] =
    useState("Contém texto");
  const [rulePurchaseConfig, setRulePurchaseConfig] = useState(
    "Vendas pendentes e aprovadas",
  );
  const [rulePurchaseValue, setRulePurchaseValue] = useState("Valor da venda");
  const [rulePurchaseProduct, setRulePurchaseProduct] = useState("Qualquer");
  const [ruleIpConfig, setRuleIpConfig] = useState(
    "Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6",
  );

  useEffect(() => {
    if (open && userId) fetchData();
  }, [open, userId]);

  const fetchData = async () => {
    setIsLoading(true);
    const [pixelsRes, accountsRes] = await Promise.all([
      getMetaPixels(userId),
      getMetaAccounts(userId),
    ]);

    if (pixelsRes.success && pixelsRes.data) {
      setPixels(
        pixelsRes.data.map((p) => ({
          id: p.id,
          name: p.name,
          pixelIds: p.pixelIds,
          type: p.type,
          status: p.status as "Ativo" | "Desativado",
          rules: p.rules,
        })),
      );
    }

    if (accountsRes.success && accountsRes.data) {
      setAccounts(accountsRes.data);
      if (accountsRes.profileName) setMetaProfileName(accountsRes.profileName);
      if (accountsRes.profileInitials)
        setMetaProfileInitials(accountsRes.profileInitials);
      if (accountsRes.userPlan) setUserPlan(accountsRes.userPlan);
    }
    setIsLoading(false);
  };

  const handleToggleAccount = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const activeAccountsCount = accounts.filter((a) => a.isActive).length;

    if (newStatus && activeAccountsCount >= maxAccountsAllowed) {
      toast.error(
        `Seu plano ${userPlan} permite apenas ${maxAccountsAllowed} contas ativas.`,
        {
          duration: 5000,
          // 🔥 REDIRECIONAMENTO PARA A PÁGINA DE PLANOS AQUI!
          action: {
            label: "Fazer Upgrade",
            onClick: () => router.push("/plans"),
          },
        },
      );
      return;
    }

    setAccounts(
      accounts.map((acc) =>
        acc.id === id ? { ...acc, isActive: newStatus } : acc,
      ),
    );

    const res = await toggleMetaAccountStatus(userId, id, newStatus);
    if (!res.success) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === id ? { ...acc, isActive: currentStatus } : acc,
        ),
      );
      toast.error("Erro ao alterar o status da conta.");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setSheetView("main"), 300);
  };

  const openPixelForm = (pixel?: Pixel) => {
    if (pixel) {
      setEditingPixel(pixel);
      setPixelName(pixel.name);
      setPixelIdsList(pixel.pixelIds);
      const rules = pixel.rules || {};
      setRuleLead(rules.lead?.enabled || "Desabilitado");
      setRuleAddToCart(rules.addToCart?.enabled || "Desabilitado");
      setRuleInitiateCheckout(rules.initiateCheckout?.enabled || "Habilitado");
      setRuleInitiateCheckoutDetection(
        rules.initiateCheckout?.detection || "Contém texto",
      );
      setRulePurchaseConfig(
        rules.purchase?.config || "Vendas pendentes e aprovadas",
      );
      setRulePurchaseValue(rules.purchase?.value || "Valor da venda");
      setRulePurchaseProduct(rules.purchase?.product || "Qualquer");
      setRuleIpConfig(
        rules.ipConfig ||
          "Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6",
      );
    } else {
      if (pixels.length >= maxPixelsAllowed) {
        return toast.error(
          `Seu plano ${userPlan} permite apenas ${maxPixelsAllowed} Pixels.`,
          {
            action: {
              label: "Fazer Upgrade",
              onClick: () => router.push("/plans"),
            },
          },
        );
      }
      setEditingPixel(null);
      setPixelName("");
      setPixelIdsList([]);
      setRuleLead("Desabilitado");
      setRuleAddToCart("Desabilitado");
      setRuleInitiateCheckout("Habilitado");
      setRuleInitiateCheckoutDetection("Contém texto");
      setRulePurchaseConfig("Vendas pendentes e aprovadas");
      setRulePurchaseValue("Valor da venda");
      setRulePurchaseProduct("Qualquer");
      setRuleIpConfig("Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6");
    }
    setSheetView("form");
  };

  const closePixelForm = () => {
    setSheetView("main");
    setEditingPixel(null);
  };

  const handleAddPixelId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = currentPixelInput.trim().replace(/,/g, "");
      if (!val) return;
      if (pixelIdsList.includes(val))
        return toast.warning("Este ID de pixel já foi adicionado.");
      setPixelIdsList([...pixelIdsList, val]);
      setCurrentPixelInput("");
    }
  };

  const removePixelId = (idToRemove: string) =>
    setPixelIdsList(pixelIdsList.filter((id) => id !== idToRemove));

  const handleSavePixel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixelName) return toast.error("O nome do Pixel é obrigatório.");
    if (pixelIdsList.length === 0)
      return toast.error("Adicione pelo menos um ID de Pixel da Meta.");

    setIsSaving(true);
    const pixelData = {
      id: editingPixel?.id,
      name: pixelName,
      pixelIds: pixelIdsList,
      type: "Meta (Facebook)",
      status: editingPixel ? editingPixel.status : "Ativo",
      rules: {
        lead: { enabled: ruleLead },
        addToCart: { enabled: ruleAddToCart },
        initiateCheckout: {
          enabled: ruleInitiateCheckout,
          detection: ruleInitiateCheckoutDetection,
        },
        purchase: {
          config: rulePurchaseConfig,
          value: rulePurchaseValue,
          product: rulePurchaseProduct,
        },
        ipConfig: ruleIpConfig,
      },
    };

    const res = await saveMetaPixel(userId, pixelData);
    if (res.success) {
      toast.success(
        editingPixel
          ? "Configurações do pixel atualizadas!"
          : "Novo pixel criado e ativado!",
      );
      await fetchData();
      closePixelForm();
    } else {
      toast.error(res.error || "Falha ao salvar pixel.");
    }
    setIsSaving(false);
  };

  const confirmDeletePixel = async () => {
    if (!pixelToDelete) return;
    const res = await deleteMetaPixel(userId, pixelToDelete.id);
    if (res.success) {
      toast.success(`Pixel "${pixelToDelete.name}" deletado com sucesso!`);
      setPixels(pixels.filter((p) => p.id !== pixelToDelete.id));
    } else {
      toast.error("Erro ao deletar o pixel.");
    }
    setPixelToDelete(null);
  };

  const confirmTogglePixel = async () => {
    if (!pixelToToggle) return;
    const newStatus = pixelToToggle.status === "Ativo" ? "Desativado" : "Ativo";
    const res = await toggleMetaPixelStatus(
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
      toast.info(
        `Pixel "${pixelToToggle.name}" foi ${newStatus.toLowerCase()}.`,
      );
    } else {
      toast.error("Erro ao alterar o status do pixel.");
    }
    setPixelToToggle(null);
  };

  const generatedScript = `<script> window.pixelIds = ${JSON.stringify(pixelIdsList)}; var a = document.createElement("script"); a.src = "https://cdn.scaledrop.com/track.js"; document.head.appendChild(a); </script>`;
  const inputClass =
    "flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all";

  const activeAccountsCount = accounts.filter((a) => a.isActive).length;

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[600px] w-full p-0 flex flex-col bg-background border-l border-border/50 z-[100] shadow-2xl">
          <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0 transition-all">
            {sheetView === "main" ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center shrink-0">
                    <Facebook
                      size={24}
                      className="text-white"
                      fill="currentColor"
                      stroke="none"
                    />
                  </div>
                  <div className="text-left">
                    <SheetTitle className="text-xl">
                      Ativos do Meta Ads
                    </SheetTitle>
                    <SheetDescription>
                      Gerencie perfis, contas de anúncio e rastreamento via
                      CAPI.
                    </SheetDescription>
                  </div>
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
                    Configure as regras avançadas da API de Conversões.
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
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
                    <TabsTrigger value="contas" className="rounded-md">
                      Contas de Anúncio
                    </TabsTrigger>
                    <TabsTrigger value="pixels" className="rounded-md">
                      Rastreio e Pixels
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
                        Sincronizando contas com a Meta...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          Perfil Conectado
                        </h4>
                        <div className="flex items-center justify-between p-4 border border-border/60 rounded-xl bg-card">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                              <span className="text-muted-foreground font-bold">
                                {metaProfileInitials}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {metaProfileName}
                              </span>
                              <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                                Token Ativo
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onReconnect}
                            className="h-8 text-xs hover:bg-muted"
                          >
                            Reconectar
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
                          <div className="text-center p-4 border border-dashed border-border/60 rounded-xl text-muted-foreground text-sm">
                            Nenhuma conta de anúncio encontrada neste perfil.
                          </div>
                        ) : ( 
                          // 🔥 SCROLL APLICADO APENAS NA LISTA (max-h-[560px])
                          <div className="border border-border/60 rounded-xl divide-y divide-border/60 bg-card overflow-y-auto max-h-[560px] custom-scrollbar">
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
                                    {acc.accountId}
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
                      <p className="text-sm">Buscando pixels na nuvem...</p>
                    </div>
                  ) : pixels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border border-dashed border-border/60 rounded-xl bg-muted/10">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Settings2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          Nenhum Pixel Configurado
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-[250px]">
                          Adicione um pixel para configurar as regras de envio
                          de eventos via API.
                        </p>
                      </div>
                      <Button
                        onClick={() => openPixelForm()}
                        className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white mt-2 gap-2"
                      >
                        <Plus size={16} /> Adicionar Novo Pixel
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
                                className="w-48 bg-popover border-border"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 font-medium"
                                  onClick={() => setPixelToToggle(pixel)}
                                >
                                  <Power
                                    size={14}
                                    className={
                                      pixel.status === "Ativo"
                                        ? "text-orange-500"
                                        : "text-emerald-500"
                                    }
                                  />
                                  {pixel.status === "Ativo"
                                    ? "Desativar Pixel"
                                    : "Ativar Pixel"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 font-medium"
                                  onClick={() => openPixelForm(pixel)}
                                >
                                  <Edit size={14} className="text-blue-500" />{" "}
                                  Editar Dados
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 font-medium"
                                  onClick={() => setPixelToDelete(pixel)}
                                >
                                  <Trash2 size={14} /> Deletar Pixel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h4 className="text-sm font-bold text-foreground mb-3 pr-8">
                            {pixel.name}
                          </h4>
                          <div className="space-y-1 text-xs text-muted-foreground font-medium">
                            <p>
                              IDs Ativos:{" "}
                              <span className="font-mono text-foreground/80">
                                {pixel.pixelIds.join(", ")}
                              </span>
                            </p>
                            <p>
                              Tipo:{" "}
                              <span className="text-foreground/80">
                                {pixel.type}
                              </span>
                            </p>
                            <p className="flex items-center gap-1.5 pt-1">
                              Status:{" "}
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold",
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
                        className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white mt-2 w-max gap-2"
                      >
                        <Plus size={16} /> Adicionar Pixel
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 z-20">
                <Button
                  onClick={handleClose}
                  className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
                >
                  Concluir Configurações
                </Button>
              </div>
            </div>

            {/* VIEW 2: FORM (ADICIONAR/EDITAR) */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full flex flex-col transition-transform duration-300 ease-in-out bg-background",
                sheetView === "form" ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form
                  id="pixelForm"
                  onSubmit={handleSavePixel}
                  className="space-y-8 pb-8"
                >
                  <div className="space-y-4">
                    <div>
                      <LabelWithTooltip
                        label="Nome"
                        tooltip="Dê um nome para identificar este conjunto de regras (Ex: Pixel EP)."
                      />
                      <input
                        value={pixelName}
                        onChange={(e) => setPixelName(e.target.value)}
                        placeholder="Meu Pixel"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <LabelWithTooltip
                        label="Tipo de Pixel"
                        tooltip="Selecione a plataforma de destino."
                      />
                      <select name="type" className={inputClass}>
                        <option value="meta">Meta (Facebook)</option>
                      </select>
                    </div>

                    <div className="bg-muted/10 p-4 rounded-xl border border-border/50 space-y-3">
                      <LabelWithTooltip
                        label="Pixels da Meta"
                        tooltip="Adicione múltiplos Pixels se desejar. Digite o ID e pressione Enter."
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
                          placeholder="Ex: 6861f767fd869..."
                          className={inputClass}
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            handleAddPixelId({
                              key: "Enter",
                              preventDefault: () => {},
                            } as any)
                          }
                          variant="secondary"
                          className="h-10"
                        >
                          Adicionar <Plus size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <LabelWithTooltip
                        label="Código do Pixel"
                        tooltip="Copie este código e cole dentro da tag <head> de todas as páginas do seu site."
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
                        Regra de Lead
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Envio de Lead"
                          tooltip="Dispara evento quando um lead é gerado (ex: inscrição de email)."
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
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Regra de Add To Cart
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Envio de Add To Cart"
                          tooltip="Dispara quando o cliente adiciona um item ao carrinho."
                        />
                        <select
                          value={ruleAddToCart}
                          onChange={(e) => setRuleAddToCart(e.target.value)}
                          className={inputClass}
                        >
                          <option value="Desabilitado">Desabilitado</option>
                          <option value="Habilitado">Habilitado</option>
                        </select>
                      </div>
                      {ruleAddToCart === "Habilitado" && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                          <LabelWithTooltip
                            label="Marcar se o botão de adicionar ao carrinho contém"
                            tooltip="Texto ou classe exata do seu botão de carrinho."
                          />
                          <input
                            placeholder="ADICIONAR AO CARRINHO"
                            className={inputClass}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Regra de Initiate Checkout
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Envio de Initiate Checkout"
                          tooltip="Dispara quando o cliente inicia o processo de compra."
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
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200 space-y-4">
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
                              <option>Contém URL</option>
                              <option>S2S Postback</option>
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
                        Regra de Purchase
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Configuração de envio"
                          tooltip="Escolha se deseja enviar boletos/pix não pagos para o painel de anúncios."
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
                          tooltip="Envie o valor total ou apenas a sua comissão."
                        />
                        <select
                          value={rulePurchaseValue}
                          onChange={(e) => setRulePurchaseValue(e.target.value)}
                          className={inputClass}
                        >
                          <option value="Valor da venda">Valor da venda</option>
                          <option value="Apenas comissão">
                            Apenas comissão
                          </option>
                        </select>
                      </div>
                      <div>
                        <LabelWithTooltip
                          label="Produto"
                          tooltip="Selecione se este pixel deve disparar para qualquer produto ou um específico."
                        />
                        <select
                          value={rulePurchaseProduct}
                          onChange={(e) =>
                            setRulePurchaseProduct(e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="Qualquer">Qualquer</option>
                          <option value="Produto Específico">
                            Produto Específico
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <h4 className="text-lg font-semibold text-foreground border-b border-border/40 pb-2">
                        Envio de IP nos eventos
                      </h4>
                      <div>
                        <LabelWithTooltip
                          label="Configuração de Endereço IP"
                          tooltip="Enviar IPv6 aumenta drasticamente o EMQ no Facebook."
                        />
                        <select
                          value={ruleIpConfig}
                          onChange={(e) => setRuleIpConfig(e.target.value)}
                          className={inputClass}
                        >
                          <option value="Enviar IPv6 se houver. Enviar IPv4 se não houver IPv6">
                            Enviar IPv6 se houver. Enviar IPv4 se não houver
                            IPv6
                          </option>
                          <option value="Apenas IPv6">Apenas IPv6</option>
                          <option value="Não enviar IP">Não enviar IP</option>
                        </select>
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
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  form="pixelForm"
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white min-w-[140px]"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Salvar Dados"
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
              Essa ação não pode ser desfeita. O pixel será removido e deixará
              de rastrear eventos.
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
              Sim, deletar pixel
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
                ? "Desativar Pixel?"
                : "Ativar Pixel?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pixelToToggle?.status === "Ativo" ? (
                <>
                  O pixel{" "}
                  <strong className="text-foreground">
                    "{pixelToToggle?.name}"
                  </strong>{" "}
                  será pausado e não enviará mais eventos para o Facebook.
                </>
              ) : (
                <>
                  O pixel{" "}
                  <strong className="text-foreground">
                    "{pixelToToggle?.name}"
                  </strong>{" "}
                  voltará a enviar eventos de rastreio imediatamente.
                </>
              )}
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
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
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
