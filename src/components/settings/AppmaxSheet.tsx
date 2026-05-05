"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Link as LinkIcon,
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
import { getOrGenerateAppmaxWebhook } from "@/actions/appmax-actions";
import Image from "next/image";

interface AppmaxSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingUrl?: string | null;
}

export function AppmaxSheet({
  open,
  onOpenChange,
  existingUrl,
}: AppmaxSheetProps) {
  const [storeName, setStoreName] = useState("Minha Loja Appmax");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // 🔥 Se ele já tem URL, pula o formulário e vai direto pra tela verde
  useEffect(() => {
    if (open) {
      if (existingUrl) {
        setGeneratedUrl(existingUrl);
      } else {
        setGeneratedUrl(null);
        setStoreName("Minha Loja Appmax");
      }
    }
  }, [open, existingUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName) return toast.error("Preencha o nome da integração.");

    setIsLoading(true);
    const res = await getOrGenerateAppmaxWebhook(storeName);

    if (res?.success && res.integrationId) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setGeneratedUrl(`${baseUrl}/api/webhooks/appmax?id=${res.integrationId}`);
      toast.success("Webhook criado com sucesso!");
    } else {
      toast.error("Erro ao gerar webhook.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("URL copiada com sucesso!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* 🔥 Largura padronizada e estrutura idêntica à Yampi */}
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-background border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo com fundo branco para contraste */}
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/appmax.png"
                alt="Appmax"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Appmax</SheetTitle>
              <SheetDescription>
                Configure o Webhook para rastreio de vendas.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedUrl ? (
            <form id="appmaxForm" onSubmit={handleSave} className="space-y-6">
              {/* Caixa de Atenção/Instruções (No mesmo padrão da Yampi, mas com cor Azul/Aviso) */}
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Configuração via Apphook
                </p>
                <p className="text-xs text-amber-500/80 mt-1">
                  Vá na Appmax em Configurações &gt; Apphooks &gt; Novo Webhook.
                  Copie a URL que será gerada abaixo e selecione os eventos
                  obrigatórios.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">
                    Nome da Integração
                  </label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Minha Loja Appmax"
                    className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-foreground block uppercase tracking-wider text-left">
                    Eventos Obrigatórios na Appmax
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-muted/20 border border-border/50 p-4 rounded-lg">
                    <ul className="space-y-2 list-inside list-disc">
                      <li>Pedido aprovado</li>
                      <li>Pedido autorizado</li>
                      <li>Boleto Gerado</li>
                      <li>Pedido pago</li>
                      <li>Pedido Estornado</li>
                      <li>Upsell pago</li>
                    </ul>
                    <ul className="space-y-2 list-inside list-disc">
                      <li>Pix Gerado</li>
                      <li>Pix Pago</li>
                      <li>Pedido integrado</li>
                      <li>Ped. Autorizado (atraso)</li>
                      <li>Pag. não autorizado</li>
                      <li>Pag. não aut. (atraso)</li>
                    </ul>
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
                  {existingUrl === generatedUrl
                    ? "Seu Webhook da Appmax"
                    : "Webhook gerado com sucesso!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {existingUrl === generatedUrl
                    ? "Copie o link abaixo se precisar cadastrar novamente."
                    : "Agora basta colar o link abaixo lá na Appmax."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                  Sua URL Exclusiva
                </label>
                <div className="relative group">
                  <input
                    readOnly
                    value={generatedUrl}
                    className="flex h-10 w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[13px] font-mono text-muted-foreground pr-10 outline-none cursor-pointer"
                    onClick={copyToClipboard}
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {!generatedUrl && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="appmaxForm"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Criar Webhook"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
