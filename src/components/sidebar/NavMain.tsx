import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
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

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutGrid,
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
      { title: "Visão Geral", url: "/finance", icon: PieChart },
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
      { title: "Resumo", url: "/marketing", icon: PanelsTopLeft },
      { title: "Meta", url: "/marketing/meta", icon: Facebook },
      { title: "Google", url: "/marketing/google", icon: Youtube },
      { title: "UTMs", url: "/marketing/utms", icon: Clipboard },
      { title: "Regras", url: "/marketing/rules", icon: Wrench },
      { title: "Relatórios", url: "/marketing/reports", icon: FileSpreadsheet },
    ],
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
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
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive} // Mantém aberto se estiver na página
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {/* CASO 1: TEM SUBMENU (Ex: Financeiro) */}
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {/* A setinha que gira quando abre/fecha */}
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  // CASO 2: NÃO TEM SUBMENU (Ex: Dashboard, Produtos)
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
