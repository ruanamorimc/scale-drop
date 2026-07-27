import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UsefulScripts } from "@/components/settings/UsefulScripts";

export const metadata = {
  title: "Códigos e Scripts | Scale Drop",
};

export default async function ScriptsPage() {
  // 1. Pegamos os cabeçalhos da página (necessário pro Better Auth no servidor)
  const requestHeaders = await headers();

  // 2. Lemos a sessão usando o padrão do Better Auth
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  // Se não tiver sessão (não estiver logado), manda pro login
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scripts da Loja</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os códigos de rastreamento e parametrização das suas
          campanhas.
        </p>
      </div>

      {/* Chama o componente passando o ID do usuário logado */}
      <UsefulScripts userId={session.user.id} />
    </div>
  );
}
