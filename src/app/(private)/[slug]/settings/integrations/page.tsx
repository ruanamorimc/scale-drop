import { IntegrationsList } from "@/components/settings/IntegrationList";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // =========================================================================
  // BLOCO 1: AUTENTICAÇÃO E SESSÃO
  // =========================================================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return <div>Usuário não autenticado.</div>;
  }

  const userId = session.user.id;

  const currentWorkspace = await prisma.workspace.findUnique({
    where: { slug: slug },
  });

  if (!currentWorkspace) {
    return <div>Workspace não encontrado. Verifique a URL.</div>;
  }

  const workspaceId = currentWorkspace.id;

  // =========================================================================
  // BLOCO 2: BUSCAR DADOS DO USUÁRIO (PLANO, URL E META ADS)
  // =========================================================================
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      metaAccessToken: true, // 🔥 Buscamos o token do Meta no banco!
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 🔥 Se o token existe e não é nulo, o Meta está conectado!
  const isMetaConnected = !!dbUser?.metaAccessToken;

  // =========================================================================
  // BLOCO 3: MERCADO LIVRE
  // =========================================================================
  const mlIntegrations = await prisma.storeIntegration.findMany({
    where: {
      userId: userId,
      workspaceId: workspaceId,
      platform: "MERCADO_LIVRE",
      isConnected: true,
    },
  });

  const formattedMlStores = mlIntegrations.map((store) => ({
    id: store.id,
    storeName:
      store.storeName ||
      `Loja ID: ${store.storeId || store.id.substring(0, 4)}`,
    isActive: store.isActive || false,
  }));

  const isMLConnected = formattedMlStores.length > 0;

  // =========================================================================
  // BLOCO 4: BUSCAR OUTRAS INTEGRAÇÕES
  // =========================================================================
  const yampiIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "YAMPI" },
  });
  const isYampiConnected = !!yampiIntegration;
  const yampiUrl = yampiIntegration
    ? `${appUrl}/api/webhooks/yampi?id=${yampiIntegration.id}`
    : null;

  const cartpandaIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "CARTPANDA" },
  });
  const isCartpandaConnected = !!cartpandaIntegration;
  const cartpandaUrl = cartpandaIntegration
    ? `${appUrl}/api/webhooks/cartpanda?id=${cartpandaIntegration.id}`
    : null;

  const shopifyIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "SHOPIFY" },
  });
  const isShopifyConnected = !!shopifyIntegration;
  const shopifyDomain = shopifyIntegration?.storeName || null;

  const appmaxIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "APPMAX" },
  });
  const isAppmaxConnected = !!appmaxIntegration;
  const appmaxUrl = appmaxIntegration
    ? `${appUrl}/api/webhooks/appmax?id=${appmaxIntegration.id}`
    : null;

  const pagarmeIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "PAGARME" },
  });
  const isPagarmeConnected = !!pagarmeIntegration;
  const pagarmeUrl = pagarmeIntegration
    ? `${appUrl}/api/webhooks/pagarme?id=${pagarmeIntegration.id}`
    : null;

  const nuvemshopIntegration = await prisma.storeIntegration.findFirst({
    where: { userId: userId, workspaceId: workspaceId, platform: "NUVEMSHOP" },
  });
  const isNuvemshopConnected = !!nuvemshopIntegration;
  const nuvemshopStoreName = nuvemshopIntegration?.storeName || null;

  // =========================================================================
  // BLOCO 5: RENDERIZAR O COMPONENTE FRONTEND
  // =========================================================================
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte suas lojas externas para sincronizar pedidos.
        </p>
      </div>

      <IntegrationsList
        userId={userId}
        userPlan={dbUser?.plan || "START"}
        // 🔥 Repassando o status real do Meta para o Frontend
        isMetaConnected={isMetaConnected}
        // MERCADO LIVRE
        isMLConnected={isMLConnected}
        mlStores={formattedMlStores}
        // Outras plataformas
        isYampiConnected={isYampiConnected}
        yampiUrl={yampiUrl}
        isCartpandaConnected={isCartpandaConnected}
        cartpandaUrl={cartpandaUrl}
        isShopifyConnected={isShopifyConnected}
        shopifyDomain={shopifyDomain}
        isAppmaxConnected={isAppmaxConnected}
        appmaxUrl={appmaxUrl}
        isPagarmeConnected={isPagarmeConnected}
        pagarmeUrl={pagarmeUrl}
        isNuvemshopConnected={isNuvemshopConnected}
        nuvemshopStoreName={nuvemshopStoreName}
      />
    </div>
  );
}
