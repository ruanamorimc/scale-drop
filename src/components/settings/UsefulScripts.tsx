"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UsefulScriptsProps {
  userId: string;
}

export function UsefulScripts({ userId }: UsefulScriptsProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.scaledrop.com";
  const scriptBase = `<script src="${appUrl}/scripts/track.js?id=${userId}" async defer></script>`;

  const codes = {
    facebook:
      "utm_source={{site_source_name}}&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{placement}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{adset.name}}|{{adset.id}}",
    google:
      "utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}",
    tiktok:
      "utm_source=tiktok&utm_medium=cpc&utm_campaign=__CAMPAIGN_NAME__|__CAMPAIGN_ID__&utm_content=__AD_NAME__|__AD_ID__",
    script: scriptBase,
  };

  const handleCopy = (text: string, id: string, successMessage: string) => {
    navigator.clipboard.writeText(text);

    setCopiedStates((prev) => ({ ...prev, [id]: true }));
    toast.success(successMessage);

    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-8 lg:w-[90%] xl:w-[80%] animate-in fade-in duration-500 pb-10">
      {/* ========================================== */}
      {/* BLOCO 1: CÓDIGOS DE ANÚNCIOS (UTMS) */}
      {/* ========================================== */}
      <div className="border border-border/50 bg-card dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Códigos de UTMs
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-border/40">
          {/* Item: Facebook */}
          <div className="flex items-center justify-between p-6 hover:bg-muted/50 dark:hover:bg-muted/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm p-2">
                <Image
                  src="/logos/facebook.svg"
                  alt="Facebook"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Código de UTMs do Facebook
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Copie o código para colocar nos anúncios do Meta Ads.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                handleCopy(codes.facebook, "fb", "UTMs do Facebook copiadas!")
              }
              variant={copiedStates["fb"] ? "default" : "secondary"}
              className={cn(
                "w-[140px] gap-2 transition-all",
                copiedStates["fb"]
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white",
              )}
            >
              {copiedStates["fb"] ? (
                <CheckCircle2 size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copiedStates["fb"] ? "Copiado" : "Copiar Código"}
            </Button>
          </div>

          {/* Item: Google Ads */}
          <div className="flex items-center justify-between p-6 hover:bg-muted/50 dark:hover:bg-muted/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm p-2">
                <Image
                  src="/logos/google-ads.svg"
                  alt="Google Ads"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Código de UTMs do Google
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Copie o código para colocar nos anúncios de Pesquisa e
                  YouTube.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                handleCopy(codes.google, "google", "UTMs do Google copiadas!")
              }
              variant={copiedStates["google"] ? "default" : "secondary"}
              className={cn(
                "w-[140px] gap-2 transition-all",
                copiedStates["google"]
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white",
              )}
            >
              {copiedStates["google"] ? (
                <CheckCircle2 size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copiedStates["google"] ? "Copiado" : "Copiar Código"}
            </Button>
          </div>

          {/* Item: TikTok Ads */}
          <div className="flex items-center justify-between p-6 hover:bg-muted/50 dark:hover:bg-muted/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm p-2">
                <Image
                  src="/logos/tiktok.svg"
                  alt="TikTok"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Código de UTMs do TikTok
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Copie o código para colocar nas suas campanhas do TikTok Ads.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                handleCopy(codes.tiktok, "tiktok", "UTMs do TikTok copiadas!")
              }
              variant={copiedStates["tiktok"] ? "default" : "secondary"}
              className={cn(
                "w-[140px] gap-2 transition-all",
                copiedStates["tiktok"]
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white",
              )}
            >
              {copiedStates["tiktok"] ? (
                <CheckCircle2 size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copiedStates["tiktok"] ? "Copiado" : "Copiar Código"}
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* BLOCO 2: SCRIPTS DA LOJA */}
      {/* ========================================== */}
      <div className="border border-border/50 bg-card dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="px-6 py-4 border-b border-border/40 bg-muted/30 dark:bg-muted/10">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Scripts da Loja
          </h3>
        </div>

        <div className="flex flex-col divide-y divide-border/40">
          {/* Item: Script Base */}
          <div className="flex items-center justify-between p-6 hover:bg-muted/50 dark:hover:bg-muted/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm p-2.5">
                <Image
                  src="/icons/script-icon.png"
                  alt="Script Base"
                  width={32}
                  height={32}
                  className="object-contain opacity-90"
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">
                  Script de Rastreio Base (track.js)
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cole este script na tag &lt;head&gt; da sua Página de Vendas
                  para ativar a captura.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                handleCopy(
                  codes.script,
                  "scriptBase",
                  "Script copiado para a área de transferência!",
                )
              }
              variant={copiedStates["scriptBase"] ? "default" : "secondary"}
              className={cn(
                "w-[140px] gap-2 transition-all",
                copiedStates["scriptBase"]
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white",
              )}
            >
              {copiedStates["scriptBase"] ? (
                <CheckCircle2 size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copiedStates["scriptBase"] ? "Copiado" : "Copiar Script"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
