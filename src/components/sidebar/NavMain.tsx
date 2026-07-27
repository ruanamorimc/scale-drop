"use client";

// 🔥 1. Importamos o useParams além do usePathname
import { usePathname, useParams } from "next/navigation";

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

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
    exact: true,
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
    url: "/tracking",
    icon: Truck,
  },
  {
    title: "Financeiro",
    url: "#",
    icon: ChartArea,
    isActive: false,
    items: [
      { title: "Visão Geral", url: "/finance", icon: PieChart, exact: true },
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
      { title: "Resumo", url: "/marketing", icon: PanelsTopLeft, exact: true },
      { title: "Meta", url: "/marketing/meta", icon: Facebook },
      { title: "Google", url: "/marketing/google", icon: Youtube },
      { title: "UTMs", url: "/marketing/utms", icon: Clipboard },
      { title: "Regras", url: "/marketing/rules", icon: Wrench },
      { title: "Relatórios", url: "/marketing/reports", icon: FileSpreadsheet },
    ],
  },
];

export function NavMain({ fallbackSlug }: { fallbackSlug: string }) {
  const pathname = usePathname();
  const params = useParams();

  // 🔥 A MÁGICA: Tenta pegar da URL, se for undefined, pega do banco!
  const slug = (params.slug as string) || fallbackSlug;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* MENU PRINCIPAL */}
        <SidebarMenu>
          {items.map((item) => {
            // 🔥 3. Ajustamos a lógica de ativo para comparar com a URL completa (slug + url)
            const isChildActive = item.items?.some((subItem) => {
              const fullSubUrl = `/${slug}${subItem.url}`;
              return (
                pathname === fullSubUrl || pathname.startsWith(`${fullSubUrl}/`)
              );
            });

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
                        {item.items.map((subItem) => {
                          // 🔥 4. Montamos a URL completa do submenu antes de passar para o SidebarLink
                          const fullSubUrl = `/${slug}${subItem.url}`;

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarLink
                                url={fullSubUrl} // Passando a nova URL
                                title={subItem.title}
                                icon={subItem.icon}
                                isSubItem={true}
                                exact={(subItem as any).exact}
                              />
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            // CASO 2: ITEM SIMPLES
            // 🔥 5. Montamos a URL completa do item principal (ignorando se for "#")
            const fullUrl = item.url === "#" ? "#" : `/${slug}${item.url}`;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarLink
                  url={fullUrl} // Passando a nova URL
                  title={item.title}
                  icon={item.icon}
                  exact={(item as any).exact}
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
