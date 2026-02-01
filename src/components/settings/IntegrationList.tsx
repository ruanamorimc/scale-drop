"use client";

import { connectMercadoLivreAction } from "@/actions/mercadolivre-actions";

import { ExternalLink } from "lucide-react";
import Image from "next/image"; // ✅ Importe o Image do Next
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Definição do Tipo
type Integration = {
  id: string;
  name: string;
  url: string;
  logoUrl: string;
  description: string;
  isConnected: boolean;
};

// ✅ Seus dados apontando para a pasta PUBLIC
const integrations: Integration[] = [
  {
    id: "mercadolivre",
    name: "Mercado Livre",
    url: "mercadolivre.com.br",
    logoUrl: "/logos/mercadolivre.svg", // 👇 Caminho relativo à pasta public
    description:
      "Importe seus pedidos, sincronize estoque e gerencie etiquetas.",
    isConnected: true,
  },
  {
    id: "shopify",
    name: "Shopify",
    url: "shopify.com",
    logoUrl: "/logos/shopify.svg", // 👇 Caminho relativo à pasta public
    description: "A plataforma de comércio global. Sincronize produtos.",
    isConnected: false,
  },
  {
    id: "shopee",
    name: "Shopee",
    url: "shopee.com",
    logoUrl: "/logos/shopee.svg", // 👇 Caminho relativo à pasta public
    description:
      "Expanda suas vendas no marketplace asiático com integração completa de catálogo.",
    isConnected: false,
  },
  // ... outros ...
];

export function IntegrationsList() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
      {integrations.map((app) => (
        <Card
          key={app.id}
          className="flex flex-col justify-between border-neutral-800 bg-transparent transition-all hover:border-neutral-700 hover:bg-neutral-900/20"
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-lg font-semibold text-white">
                {app.name}
              </CardTitle>
              <a
                href={`https://${app.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
              >
                {app.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Container da Logo */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-800 bg-white p-2">
              <Image
                src={app.logoUrl}
                alt={`Logo ${app.name}`}
                width={50} // 👈 Obrigatório: Largura base para renderização
                height={50} // 👈 Obrigatório: Altura base para renderização
                className="h-full w-full object-contain" // O CSS cuida do tamanho final visual
              />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-2">
              {app.description}
            </p>
          </CardContent>

          <CardFooter className="pt-2">
            <form
              action={async () => {
                // Se for Mercado Livre, chama a action
                if (app.id === "ml") {
                  await connectMercadoLivreAction();
                } else {
                  alert("Integração em breve!");
                }
              }}
              className="w-full"
            >
              <Button
                type="submit" // Mudou para type="submit" para disparar a action
                variant={app.isConnected ? "outline" : "secondary"}
                className={`w-full gap-2 border-neutral-800 transition-all ${
                  app.isConnected
                    ? "bg-green-950/10 text-green-500 border-green-900/30 hover:bg-green-950/20"
                    : "hover:bg-neutral-800"
                }`}
              >
                <span className="relative flex h-2.5 w-2.5 mr-1">
                  {app.isConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${app.isConnected ? "bg-green-500" : "bg-red-500"}`}
                  ></span>
                </span>

                <span className="font-medium">
                  {app.isConnected ? "Conectado" : "Conectar"}
                </span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
