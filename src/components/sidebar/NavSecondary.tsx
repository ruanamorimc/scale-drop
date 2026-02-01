import { IconHelp, IconSearch, IconSettings } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Configurações",
    url: "/settings",
    icon: IconSettings,
  },
  {
    title: "Ajuda",
    url: "/help",
    icon: IconHelp,
  },
  {
    title: "Pesquisar",
    url: "#",
    icon: IconSearch,
  },
];

export function NavSecondary() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
