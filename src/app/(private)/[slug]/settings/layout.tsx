import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/profile/SidebarNav";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Gerencie as configurações da sua conta.",
};

// 🔥 1. Adicionamos a tipagem dos parâmetros da URL (params)
interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// 🔥 2. Transformamos o Layout em async para poder usar o await no params
export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  // 🔥 3. Extraímos o slug do Workspace atual
  const { slug } = await params;

  // 🔥 4. Trazemos o menu para dentro do componente e injetamos o slug nas URLs
  const sidebarNavItems = [
    { title: "Geral", href: `/${slug}/settings` },
    { title: "Segurança", href: `/${slug}/settings/security` },
    { title: "Planos e Cobrança", href: `/${slug}/settings/billing` },
    { title: "Integrações", href: `/${slug}/settings/integrations` },
    { title: "Códigos e Scripts", href: `/${slug}/settings/scripts` },
  ];

  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e preferências.
        </p>
      </div>
      <Separator className="my-6" />

      {/* 👇 LAYOUT CORRIGIDO: Flexbox com largura fixa na sidebar */}
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-64 shrink-0">
          {" "}
          {/* w-64 garante tamanho fixo */}
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
