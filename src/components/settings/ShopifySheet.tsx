"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Key,
  Globe,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { saveShopifyIntegration } from "@/actions/shopify-actions";
import Image from "next/image";

interface ShopifySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  existingStore?: string | null;
}

export function ShopifySheet({
  open,
  onOpenChange,
  userId,
  existingStore,
}: ShopifySheetProps) {
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      const cleanExisting = existingStore
        ? existingStore.replace(".myshopify.com", "")
        : "";
      setShopDomain(cleanExisting);
      setAccessToken("");
      setIsSuccess(false);
    }
  }, [open, existingStore]);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase();
    value = value.replace(/https?:\/\//g, "");
    value = value.replace(/www\./g, "");
    value = value.replace(/\.myshopify\.com.*/g, "");
    value = value.replace(/[^a-z0-9-]/g, "");
    setShopDomain(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain || !accessToken)
      return toast.error("Preencha todos os campos.");
    if (!accessToken.startsWith("shpat_"))
      return toast.error("O token deve começar com 'shpat_'");

    setIsLoading(true);
    const fullDomain = `${shopDomain}.myshopify.com`;

    const res = await saveShopifyIntegration(userId, {
      shopDomain: fullDomain,
      accessToken,
    });

    if (res.success) {
      setIsSuccess(true);
      if (res.warning) {
        toast.warning(res.warning, { duration: 6000 });
      } else {
        toast.success("Shopify conectada com sucesso!");
      }
    } else {
      toast.error(res.error || "Erro ao conectar Shopify.");
    }
    setIsLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[520px] w-full p-0 flex flex-col bg-background border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#95BF47] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Image
                src="/logos/shopify.svg"
                alt="Shopify"
                width={24}
                height={24}
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">
                Integração Shopify Full
              </SheetTitle>
              <SheetDescription>
                Rastreio de vendas, injeção de scripts e logística.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!isSuccess ? (
            <form id="shopifyForm" onSubmit={handleSave} className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl">
                <p className="text-sm text-emerald-600 font-bold flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} /> Configuração do App Personalizado
                </p>
                <ol className="text-xs text-emerald-600/90 space-y-3 list-decimal ml-4 text-left">
                  <li>
                    Na Shopify, vá em{" "}
                    <b>Configurações &gt; Apps &gt; Desenvolver Apps</b> e crie
                    um app chamado <b>Scale Drop</b>.
                  </li>
                  <li>
                    Em <b>Configuração da API do Admin</b>, marque as permissões
                    de <b>LEITURA e GRAVAÇÃO</b> (Read/Write) para:
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        <p className="font-bold text-[10px]">
                          RASTREIO DE VENDAS
                        </p>
                        <code className="text-[9px] opacity-70">
                          Orders / Customers
                        </code>
                      </div>
                      <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        <p className="font-bold text-[10px]">
                          AUTOMAÇÃO DE SCRIPTS
                        </p>
                        <code className="text-[9px] opacity-70">
                          Themes / Script Tags
                        </code>
                      </div>
                      <div className="bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                        <p className="font-bold text-[10px]">
                          LOGÍSTICA E RASTREIO
                        </p>
                        <code className="text-[9px] opacity-70">
                          Fulfillments / Products
                        </code>
                      </div>
                    </div>
                  </li>
                  <li>
                    Instale o app e copie o <b>Admin API access token</b>{" "}
                    (shpat_...).
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider text-left">
                    Domínio da Loja
                  </label>
                  <div className="flex rounded-md border border-border/60 bg-background overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all h-11">
                    <div className="pl-3 flex items-center justify-center text-muted-foreground border-r border-border/60 bg-muted/10">
                      <Globe size={16} className="mr-2" />
                    </div>
                    <input
                      value={shopDomain}
                      onChange={handleDomainChange}
                      placeholder="minha-loja"
                      className="flex-1 bg-transparent px-3 py-2 text-sm outline-none font-medium"
                      required
                    />
                    <div className="flex items-center bg-muted/10 px-3 text-sm text-muted-foreground border-l border-border/60 select-none">
                      .myshopify.com
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider text-left">
                    Admin API Access Token
                  </label>
                  <div className="relative">
                    <Key
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex h-11 w-full rounded-md border border-border/60 bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Poder Total Concedido!
                </h3>
                <p className="text-sm text-muted-foreground px-4">
                  O Scale Drop agora tem permissão para rastrear vendas,
                  gerenciar logística e automatizar seus scripts.
                </p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-left">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Lembre-se: O rastreio em tempo real via Webhook só será
                  ativado 100% quando o sistema estiver publicado em um domínio
                  HTTPS (fora do localhost).
                </p>
              </div>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full bg-[#95BF47] hover:bg-[#82a83e] text-white font-bold h-12"
              >
                Finalizar Configuração
              </Button>
            </div>
          )}
        </div>

        {!isSuccess && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="shopifyForm"
              disabled={isLoading}
              className="bg-[#95BF47] hover:bg-[#82a83e] text-white min-w-[140px] font-bold h-10"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Ativar Integração"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
