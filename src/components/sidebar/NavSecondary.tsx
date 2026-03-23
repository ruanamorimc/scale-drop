"use client";

import { IconHelp, IconSearch, IconSettings } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// 🔥 Importe o nosso componente SidebarLink
import { SidebarLink } from "./SidebarLink";

const items = [
  {
    title: "Configurações",
    url: "/settings/integrations",
    icon: IconSettings,
    // Se você tiver sub-páginas em configurações (ex: /settings/profile),
    // pode remover o exact: true para que o menu fique aceso nelas também.
    exact: false,
  },
  {
    title: "Ajuda",
    url: "/help",
    icon: IconHelp,
    exact: true,
  },
  {
    title: "Pesquisar",
    url: "#",
    icon: IconSearch,
    exact: true,
  },
];

export function NavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      {" "}
      {/* mt-auto para empurrar para baixo, se necessário */}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {/* 🔥 Substituição pelo SidebarLink */}
              <SidebarLink
                url={item.url}
                title={item.title}
                icon={item.icon}
                exact={item.exact}
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
