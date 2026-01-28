import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white gap-8 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Escolha seu Plano</h1>
        <p className="text-neutral-400">
          Você precisa de uma assinatura ativa para acessar o Dashboard.
        </p>
      </div>

      <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Pro Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-bold">
            R$ 49,90
            <span className="text-sm font-normal text-neutral-400">/mês</span>
          </p>
          <ul className="space-y-2 text-neutral-300">
            <li>✅ Acesso completo ao Dashboard</li>
            <li>✅ Produtos ilimitados</li>
            <li>✅ Suporte prioritário</li>
          </ul>

          {/* AQUI NO FUTURO VAI O BOTÃO DO STRIPE */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Assinar Agora
          </Button>

          <div className="pt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-neutral-500 hover:underline"
            >
              Tentar acessar dashboard (Teste de Bloqueio)
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
