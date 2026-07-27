"use client";

import { useParams } from "next/navigation";
import { IconHelp, IconSend, IconSettings } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { SidebarLink } from "./SidebarLink";

const items = [
  {
    title: "Configurações",
    url: "/settings/integrations",
    icon: IconSettings,
    exact: false,
  },
  {
    title: "Ajuda",
    url: "/help",
    icon: IconHelp,
    exact: true,
    isGlobal: true, // 🔥 Adicionamos isso para indicar que a rota fica fora do [slug]
  },
  {
    title: "Feedback",
    url: "#",
    icon: IconSend,
    exact: true,
  },
];

export function NavSecondary({ fallbackSlug }: { fallbackSlug: string }) {
  const params = useParams();

  // 🔥 A MÁGICA:
  const slug = (params.slug as string) || fallbackSlug;

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // 🔥 A MÁGICA: Monta a URL dinamicamente
            // Se for "#" ou uma rota global (como o Help), usa a URL original.
            // Se for rota de painel (como Settings), injeta o slug!
            const fullUrl =
              item.url === "#" || item.isGlobal
                ? item.url
                : `/${slug}${item.url}`;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarLink
                  url={fullUrl} // Passando a URL construída
                  title={item.title}
                  icon={item.icon}
                  exact={item.exact}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
