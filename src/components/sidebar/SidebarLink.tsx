"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  SidebarMenuButton,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

interface SidebarLinkProps {
  url: string;
  title: string;
  icon?: LucideIcon | React.ElementType;
  isSubItem?: boolean;
  exact?: boolean;
}

export function SidebarLink({
  url,
  title,
  icon: Icon,
  isSubItem = false,
  exact = false,
}: SidebarLinkProps) {
  const pathname = usePathname();

  // Lógica de Ativação Refinada
  const isActive = exact
    ? pathname === url // Se exact=true, tem que ser idêntico
    : url === "/"
      ? pathname === "/"
      : pathname === url || pathname.startsWith(`${url}/`);

  // Seleciona o componente base correto do shadcn sidebar
  const Component = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

  return (
    <Component
      asChild
      isActive={isActive}
      className={cn(
        "relative transition-all duration-300 group cursor-pointer overflow-hidden",
        // Estilo Base
        "hover:bg-muted/50 hover:text-foreground text-muted-foreground",

        // 🔥 ESTILO ATIVO (O Glow Azul + Barrinha)
        // Aplicado para AMBOS (Item Principal e Sub-item) para manter o padrão da imagem 2
        isActive &&
          "bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent text-blue-500 font-medium hover:bg-blue-600/20 hover:text-blue-400",
      )}
    >
      <Link href={url} className="flex items-center gap-2 w-full">
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4 transition-colors shrink-0",
              isActive
                ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        )}
        <span className="truncate">{title}</span>

        {/* 🔥 BARRINHA LATERAL BRILHANTE (Agora aparece para TODOS os itens ativos) */}
        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full bg-blue-500 shadow-[0_0_12px_2px_rgba(59,130,246,0.8)] animate-in fade-in slide-in-from-right-1 duration-300" />
        )}
      </Link>
    </Component>
  );
}
