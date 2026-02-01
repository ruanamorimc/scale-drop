import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/profile/SidebarNav";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Gerencie as configurações da sua conta.",
};

const sidebarNavItems = [
  { title: "Geral", href: "/settings" },
  { title: "Segurança", href: "/settings/security" },
  { title: "Planos e Cobrança", href: "/settings/billing" },
  { title: "Integrações", href: "/settings/integrations" }, // Nossa futura integração ML
  /* { title: "Notificações", href: "/settings/notifications" }, */
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
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
