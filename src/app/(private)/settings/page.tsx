import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/profile/ProfileForm";
// 👇 Importe sua função de pegar sessão (Exemplo baseado no auth-client que vi)
// Se for Server Component, talvez você use 'auth.api.getSession' ou similar do BetterAuth
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Ajuste conforme sua config do Better Auth no server

export default async function SettingsProfilePage() {
  // Buscando o usuário real no servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user || null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Isso é como os outros usuários verão você no site.
        </p>
      </div>
      <Separator />

      {/* Passamos o usuário real para o formulário */}
      <ProfileForm user={user} />
    </div>
  );
}
