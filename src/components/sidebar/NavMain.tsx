"use client";

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Calculator,
  ChartArea,
  ChevronRight,
  Clipboard,
  DollarSign,
  Facebook,
  FileSpreadsheet,
  LayoutGrid,
  Megaphone,
  Package,
  PanelsTopLeft,
  Percent,
  PieChart,
  Tag,
  Truck,
  Wrench,
  Youtube,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

import { SidebarLink } from "./SidebarLink";

// Adicionei 'exact: true' no "Visão Geral" e no "Resumo"
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
    exact: true, // Dashboard geralmente é raiz
  },
  {
    title: "Pedidos",
    url: "/orders",
    icon: Package,
  },
  {
    title: "Produtos e Custos",
    url: "/products",
    icon: Tag,
  },
  {
    title: "Rastreio",
    url: "#",
    icon: Truck,
  },
  {
    title: "Financeiro",
    url: "#",
    icon: ChartArea,
    isActive: false,
    items: [
      { title: "Visão Geral", url: "/finance", icon: PieChart, exact: true }, // 🔥 Adicionado exact
      { title: "Taxas", url: "/finance/fees", icon: Percent },
      { title: "Impostos", url: "/finance/taxes", icon: DollarSign },
      { title: "Calculadora", url: "/finance/calculator", icon: Calculator },
    ],
  },
  {
    title: "Marketing",
    url: "#",
    icon: Megaphone,
    isActive: false,
    items: [
      { title: "Resumo", url: "/marketing", icon: PanelsTopLeft, exact: true }, // 🔥 Adicionado exact
      { title: "Meta", url: "/marketing/meta", icon: Facebook },
      { title: "Google", url: "/marketing/google", icon: Youtube },
      { title: "UTMs", url: "/marketing/utms", icon: Clipboard },
      { title: "Regras", url: "/marketing/rules", icon: Wrench },
      { title: "Relatórios", url: "/marketing/reports", icon: FileSpreadsheet },
    ],
  },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* QUICK CREATE */}
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* MENU PRINCIPAL */}
        <SidebarMenu>
          {items.map((item) => {
            const isChildActive = item.items?.some(
              (subItem) =>
                pathname === subItem.url ||
                pathname.startsWith(`${subItem.url}/`),
            );

            // CASO 1: TEM SUBMENU
            if (item.items && item.items.length > 0) {
              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive || isChildActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarLink
                              url={subItem.url}
                              title={subItem.title}
                              icon={subItem.icon}
                              isSubItem={true}
                              exact={(subItem as any).exact} // 🔥 Passa a prop exact
                            />
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // CASO 2: ITEM SIMPLES
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarLink
                  url={item.url}
                  title={item.title}
                  icon={item.icon}
                  exact={(item as any).exact} // 🔥 Passa a prop exact
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
