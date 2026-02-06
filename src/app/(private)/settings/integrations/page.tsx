import { IntegrationsList } from "@/components/settings/IntegrationList";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { testImportProductsAction } from "@/actions/mercadolivre-actions";

export default async function IntegrationsPage() {
  // 1. Pega a sessão do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte suas lojas externas para sincronizar pedidos.
        </p>
      </div>

      {/* 3. Passa o status verdadeiro para o componente */}
      <Separator />
      <form action={testImportProductsAction}>
        <Button type="submit">TESTAR IMPORTAÇÃO (Olhar Terminal)</Button>
      </form>
      <IntegrationsList isMLConnected={isMLConnected} />
    </div>
  );
}
