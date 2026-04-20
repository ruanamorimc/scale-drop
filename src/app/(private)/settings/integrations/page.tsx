import { IntegrationsList } from "@/components/settings/IntegrationList";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function IntegrationsPage() {
  // 1. Pega a sessão do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return <div>Usuário não autenticado.</div>; // Ou redirecione para o login
  }

  let isMLConnected = false;

  // 2. Se tem usuário, verifica no banco se existe integração do ML
  if (session?.user?.id) {
    const integration = await prisma.storeIntegration.findFirst({
      where: {
        userId: session.user.id,
        platform: "MERCADO_LIVRE", // Tem que bater com o ENUM do seu banco
        isConnected: true,
      },
    });

    // Se achou, transforma em true
    isMLConnected = !!integration;
  }

  // 1. Busca a Yampi no banco
  const yampiIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: session.user.id, platform: "YAMPI" },
  });

  // 2. Define as variáveis
  const isYampiConnected = !!yampiIntegration;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const yampiUrl = yampiIntegration
    ? `${appUrl}/api/webhooks/yampi?id=${yampiIntegration.id}`
    : null;

    // 1. Busca a Cartpanda no banco
  const cartpandaIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: session.user.id, platform: "CARTPANDA" },
  });

  const isCartpandaConnected = !!cartpandaIntegration;
  const cartpandaUrl = cartpandaIntegration
    ? `${appUrl}/api/webhooks/cartpanda?id=${cartpandaIntegration.id}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte suas lojas externas para sincronizar pedidos.
        </p>
      </div>

      {/* 3. Passa o status verdadeiro para o componente */}

      {/*       <form action={testImportProductsAction}>
        <Button type="submit">TESTAR IMPORTAÇÃO (Olhar Terminal)</Button>
      </form> */}
      <IntegrationsList
        isMLConnected={isMLConnected}
        userId={session.user.id}
        isYampiConnected={isYampiConnected}
        yampiUrl={yampiUrl}
        isCartpandaConnected={isCartpandaConnected}
        cartpandaUrl={cartpandaUrl}
      />
    </div>
  );
}
