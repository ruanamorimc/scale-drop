import { Separator } from "@/components/ui/separator";
import { SecurityForm } from "@/components/settings/SecurityForm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Seu BetterAuth
import prisma from "@/lib/prisma"; // Seu Prisma Client

export default async function SettingsSecurityPage() {
  // 1. Pegar a sessão atual para saber quem é o usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null; // Ou redirecionar para login
  }

  // 2. Buscar todas as sessões ativas desse usuário no banco
  // O BetterAuth salva isso na tabela "session" (ou "Session")
  const activeSessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      expiresAt: "desc", // As mais recentes primeiro
    },
  });

  // 3. Passamos os dados reais para o formulário
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Segurança</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie a segurança da sua conta e autenticação de dois fatores.
        </p>
      </div>
      <Separator />

      {/* 👇 Passando as sessões via prop */}
      <SecurityForm
        sessions={activeSessions}
        currentSessionToken={session.session.token}
      />
    </div>
  );
}
