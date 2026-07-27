"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Plus,
  Store,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  toggleMercadoLivreStore,
  getMercadoLivreAuthUrl,
} from "@/actions/mercadolivre-actions";

interface StoreData {
  id: string;
  storeName: string;
  isActive: boolean;
}

interface MercadoLivreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedStores?: StoreData[];
}

export function MercadoLivreSheet({
  open,
  onOpenChange,
  connectedStores = [],
}: MercadoLivreSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string; // 🔥 Capturando o slug da URL

  // ==========================================
  // OUVINTE DO POPUP: Escuta a resposta de sucesso
  // ==========================================
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "ML_OAUTH_SUCCESS") {
        toast.success("Conta conectada com sucesso!");
        router.refresh();
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  // ==========================================
  // ABRIR POPUP OAUTH (COM VERIFICAÇÃO DE FECHAMENTO MANUAL)
  // ==========================================
  const handleOpenPopup = async () => {
    setIsLoading(true);
    try {
      const res = await getMercadoLivreAuthUrl(slug);

      if (res.url) {
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2 + window.screenX;
        const top = window.innerHeight / 2 - height / 2 + window.screenY;

        // Salva a referência da janela aberta
        const popup = window.open(
          res.url,
          "MercadoLivreOAuth",
          `width=${width},height=${height},top=${top},left=${left}`,
        );

        // 🔥 O ESPIÃO: Checa a cada 1 segundo se o usuário fechou o popup no 'X'
        const checkPopup = setInterval(() => {
          if (!popup || popup.closed || popup.closed === undefined) {
            clearInterval(checkPopup);
            setIsLoading(false); // Destrava o botão!
          }
        }, 1000);
      }
    } catch (error) {
      toast.error("Erro ao gerar link de conexão.");
      setIsLoading(false);
    }
  };

  // Alterna o status da loja no banco
  const handleToggle = async (storeId: string, newValue: boolean) => {
    setTogglingId(storeId);
    try {
      const res = await toggleMercadoLivreStore(storeId, newValue);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          `Loja ${newValue ? "ativada" : "desativada"} com sucesso!`,
        );
      }
    } catch (error) {
      toast.error("Erro ao alterar o status da loja.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[570px] w-full p-0 flex flex-col bg-background border-l border-border/50 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-muted/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-border/50 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/logos/mercadolivre.png"
                alt="Mercado Livre"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <SheetTitle className="text-xl">
                Contas do Mercado Livre
              </SheetTitle>
              <SheetDescription>
                Gerencie as lojas conectadas e a sincronização de pedidos.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 🔥 AVISO DE UX (ESTILO APPMAX) MOSTRADO SE JÁ HOUVER LOJA */}
          {connectedStores.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                <ShieldCheck size={16} /> Quer conectar uma loja diferente?
              </p>
              <p className="text-xs text-amber-500/80 mt-1">
                Certifique-se de estar logado na nova conta no site do Mercado
                Livre <strong>antes</strong> de clicar em Adicionar Loja.
              </p>
            </div>
          )}

          {connectedStores.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-sm text-amber-500 font-medium flex items-center gap-2">
                  <ShieldCheck size={16} /> Configuração via OAuth
                </p>
                <p className="text-xs text-amber-500/80 mt-1">
                  Você será redirecionado ao painel do Mercado Livre de forma
                  segura. Basta autorizar o aplicativo para sincronizarmos sua
                  loja automaticamente.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider text-left">
                  Recursos Sincronizados
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground bg-muted/20 border border-border/50 p-4 rounded-lg">
                  <ul className="space-y-2 list-inside list-disc">
                    <li>Importação de pedidos</li>
                    <li>Sincronização de estoque</li>
                    <li>Atualização de status</li>
                  </ul>
                  <ul className="space-y-2 list-inside list-disc">
                    <li>Emissão de etiquetas</li>
                    <li>Mensageria automática</li>
                    <li>Múltiplas contas</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground block uppercase tracking-wider">
                  Lojas Vinculadas
                </label>
                <span className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                  {connectedStores.filter((s) => s.isActive).length} ativas
                </span>
              </div>

              <div className="space-y-2">
                {connectedStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex items-center justify-between p-4 border border-border/60 rounded-lg bg-muted/10 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {store.storeName}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        ID: {store.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {togglingId === store.id && (
                        <Loader2
                          size={14}
                          className="animate-spin text-muted-foreground"
                        />
                      )}
                      <Switch
                        checked={store.isActive}
                        disabled={togglingId === store.id}
                        onCheckedChange={(checked) =>
                          handleToggle(store.id, checked)
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 bg-muted/10 shrink-0 flex justify-end gap-3 cursor-pointer">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>

          {/* 🔥 Alterado para button normal rodando a função handleOpenPopup (Sem form tag) */}
          <Button
            onClick={handleOpenPopup}
            disabled={isLoading}
            className="group relative overflow-hidden gap-2 justify-center font-medium text-xs rounded-lg shadow-sm border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 hover:scale-100 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 text-white cursor-pointer min-w-[140px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

            {connectedStores.length === 0 ? (
              <LinkIcon size={16} />
            ) : (
              <Plus size={16} />
            )}

            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : connectedStores.length === 0 ? (
              "Conectar Conta"
            ) : (
              "Adicionar Loja"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
