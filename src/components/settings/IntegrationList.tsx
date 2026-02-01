"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connectMercadoLivreAction } from "@/actions/mercadolivre-actions";

interface IntegrationsListProps {
  isMLConnected: boolean;
}

export function IntegrationsList({ isMLConnected }: IntegrationsListProps) {
  const integrations = [
    {
      id: "ml",
      name: "Mercado Livre",
      url: "mercadolivre.com.br",
      logoUrl: "/logos/mercadolivre.svg", // Confirme se é .svg ou .png na sua pasta
      description:
        "Importe seus pedidos, sincronize estoque e gerencie etiquetas.",
      isConnected: isMLConnected,
    },
    {
      id: "shopify",
      name: "Shopify",
      url: "shopify.com",
      logoUrl: "/logos/shopify.svg",
      description: "A plataforma de comércio global. Sincronize produtos.",
      isConnected: false,
    },
    {
      id: "shopee",
      name: "Shopee",
      url: "shopee.com.br",
      logoUrl: "/logos/shopee.png",
      description:
        "Expanda suas vendas no marketplace asiático com integração completa.",
      isConnected: false,
    },
  ];

  return (
    // 1. MUDANÇA AQUI: lg:grid-cols-3 para preencher a tela corretamente
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {integrations.map((app) => (
        <Card
          key={app.id}
          className="flex flex-col justify-between border-neutral-800 bg-transparent transition-all hover:border-neutral-700 hover:bg-neutral-900/20"
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
            <div className="flex flex-col space-y-2 pr-4">
              <CardTitle className="text-xl font-semibold text-white">
                {app.name}
              </CardTitle>
              <a
                href={`https://${app.url}`}
                target="_blank"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                {app.url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-white p-3">
              <Image
                src={app.logoUrl}
                alt={app.name}
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {app.description}
            </p>
          </CardContent>

          <CardFooter className="pt-6">
            {app.id === "ml" ? (
              <form action={connectMercadoLivreAction} className="w-full">
                <Button
                  type="submit"
                  disabled={app.isConnected}
                  variant={app.isConnected ? "outline" : "secondary"}
                  // 2. MUDANÇA AQUI: Adicionado 'justify-center' e ajustes de cor
                  className={`w-full h-10 gap-2 border-neutral-800 justify-center ${app.isConnected ? "bg-green-950/10 text-green-500 border-green-900/30 cursor-default" : "hover:bg-neutral-800"}`}
                >
                  {app.isConnected ? (
                    // Bolinha Verde Pulsando
                    <div className="relative flex h-2.5 w-2.5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </div>
                  ) : (
                    // Bolinha Vermelha
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  )}

                  <span className="font-medium">
                    {app.isConnected ? "Conectado" : "Conectar"}
                  </span>
                </Button>
              </form>
            ) : (
              <Button
                onClick={() => alert("Em breve!")}
                variant="secondary"
                className="w-full h-10 gap-2 border-neutral-800 hover:bg-neutral-800 justify-center"
              >
                {/* 3. MUDANÇA AQUI: Bolinha Vermelha adicionada nos outros botões */}
                <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="font-medium">Conectar</span>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
