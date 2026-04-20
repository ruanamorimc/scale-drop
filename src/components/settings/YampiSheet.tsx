"use client";

import { useState, useEffect } from "react";
import { Copy, Key, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { saveYampiIntegration } from "@/actions/yampi-actions";

interface YampiSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  existingUrl?: string | null; // 🔥 Recebe a URL se já estiver conectado
}

export function YampiSheet({ open, onOpenChange, userId, existingUrl }: YampiSheetProps) {
  const [name, setName] = useState("Minha Loja Yampi");
  const [secretToken, setSecretToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // 🔥 Se ele já tem URL, pula o formulário e vai direto pra tela verde
  useEffect(() => {
    if (open) {
      if (existingUrl) {
        setGeneratedUrl(existingUrl);
      } else {
        setGeneratedUrl(null);
        setName("Minha Loja Yampi");
        setSecretToken("");
      }
    }
  }, [open, existingUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !secretToken) return toast.error("Preencha os dados.");

    setIsLoading(true);
    const res = await saveYampiIntegration(userId, { name, secretToken });
    
    if (res.success && res.webhookUrl) {
      setGeneratedUrl(res.webhookUrl);
      toast.success("Webhook criado com sucesso!");
    } else {
      toast.error(res.error || "Erro ao gerar webhook.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      toast.success("URL copiada!");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-background border-l border-border/50">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">Integração Yampi</SheetTitle>
              <SheetDescription>Configure o Webhook para rastreio de vendas.</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {!generatedUrl ? (
            <form id="yampiForm" onSubmit={handleSave} className="space-y-6">
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
                <p className="text-sm text-orange-500 font-medium flex items-center gap-2">
                  <Key size={16} /> Atenção!
                </p>
                <p className="text-xs text-orange-500/80 mt-1">
                  Vá na Yampi em Configurações {">"} Webhooks {">"} Adicionar Novo. Copie a "Chave Secreta" que eles fornecem e cole abaixo.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">Nome da Integração</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Loja Principal" className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block uppercase tracking-wider">Token do Webhook (Chave Secreta)</label>
                  <input value={secretToken} onChange={(e) => setSecretToken(e.target.value)} placeholder="wh_hG9vRY..." className="flex h-10 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono" required />
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
                  {existingUrl === generatedUrl ? "Seu Webhook da Yampi" : "Webhook gerado com sucesso!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {existingUrl === generatedUrl ? "Copie o link abaixo se precisar cadastrar novamente." : "Agora basta cadastrar o link abaixo lá na Yampi."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider">Sua URL Exclusiva</label>
                <div className="relative group">
                  <input readOnly value={generatedUrl} className="flex h-10 w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm font-mono text-muted-foreground pr-10 outline-none cursor-pointer" onClick={copyToClipboard} />
                  <button type="button" onClick={copyToClipboard} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"><Copy size={16} /></button>
                </div>
              </div>

              <div className="pt-4">
                 <Button onClick={() => onOpenChange(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Fechar</Button>
              </div>
            </div>
          )}
        </div>

        {!generatedUrl && (
          <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" form="yampiForm" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Criar Webhook"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}