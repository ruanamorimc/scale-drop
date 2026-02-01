"use client";

import { Check, CreditCard, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function BillingSettings() {
  // Mock dos dados (Depois virão do banco/API)
  const currentPlan = {
    name: "Business Pro",
    price: "R$ 97,00",
    status: "active", // active, canceled, past_due
    renewsAt: "14 de Fev, 2026",
    usage: {
      projects: 15,
      maxProjects: 20,
      storage: 45, // em %
    },
  };

  return (
    <div className="space-y-8">
      {/* --- SEÇÃO 1: PLANO ATUAL E USO (Igual Referência) --- */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Plano Atual</h3>
          <p className="text-sm text-muted-foreground">
            Detalhes da sua assinatura e limites de uso.
          </p>
        </div>

        <Card className="bg-transparent border-neutral-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl text-white">
                  {currentPlan.name}
                </CardTitle>
                <CardDescription>{currentPlan.price} / mês</CardDescription>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 uppercase"
              >
                {currentPlan.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Barras de Progresso (Usage) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Projetos Ativos</span>
                <span className="text-white">
                  {currentPlan.usage.projects} / {currentPlan.usage.maxProjects}
                </span>
              </div>
              <Progress
                value={
                  (currentPlan.usage.projects / currentPlan.usage.maxProjects) *
                  100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Armazenamento (Dados)
                </span>
                <span className="text-white">
                  {currentPlan.usage.storage}% usado
                </span>
              </div>
              <Progress value={currentPlan.usage.storage} className="h-2" />
            </div>

            <div className="rounded-md bg-neutral-900 p-4 text-sm text-muted-foreground border border-neutral-800 flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="text-white font-medium mb-1">
                  Gerenciamento de Pagamento
                </p>
                <p>
                  Sua assinatura é processada de forma segura pela{" "}
                  <strong>Kirvano</strong>. Para atualizar seu cartão de
                  crédito, baixar notas fiscais ou cancelar sua assinatura,
                  acesse o portal.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-800 pt-6">
            <p className="text-sm text-muted-foreground">
              Próxima cobrança em:{" "}
              <span className="text-white">{currentPlan.renewsAt}</span>
            </p>
            <Button variant="outline" className="gap-2">
              Gerenciar Assinatura <ExternalLink className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* --- SEÇÃO 2: MUDAR DE PLANO (Grid em vez de Radio) --- */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Disponíveis para Upgrade</h3>
          <p className="text-sm text-muted-foreground">
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* PLANO STARTER */}
          <Card className="flex flex-col border-neutral-800 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg">Starter</CardTitle>
              <CardDescription>R$ 49/mês</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Até 5 Projetos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 1 Usuário
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Suporte Básico
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Downgrade
              </Button>
            </CardFooter>
          </Card>

          {/* PLANO PRO (ATUAL) */}
          <Card className="flex flex-col border-primary/50 bg-primary/5 relative">
            <div className="absolute -top-3 left-0 right-0 flex justify-center">
              <Badge>Plano Atual</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">Business Pro</CardTitle>
              <CardDescription>R$ 97/mês</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Até 20 Projetos
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> 5 Usuários
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Integração ML &
                  Shopify
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Suporte Prioritário
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Selecionado
              </Button>
            </CardFooter>
          </Card>

          {/* PLANO ENTERPRISE */}
          <Card className="flex flex-col border-neutral-800 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg">Enterprise</CardTitle>
              <CardDescription>R$ 197/mês</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Projetos Ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> Usuários Ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" /> API Dedicada
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Fazer Upgrade</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* --- SEÇÃO 3: ZONA DE PERIGO (CANCELAMENTO) --- */}
      <section>
        <Card className="border-red-900/20 bg-red-900/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle className="text-lg">Zona de Perigo</CardTitle>
            </div>
            <CardDescription>
              Ações que afetam sua assinatura de forma crítica.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Cancelar Assinatura</p>
              <p className="text-sm text-muted-foreground">
                Você perderá acesso aos recursos Pro no final do ciclo de
                cobrança atual.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
