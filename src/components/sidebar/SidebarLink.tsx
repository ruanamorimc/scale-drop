"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = exact
    ? pathname === url
    : url === "/"
      ? pathname === "/"
      : pathname === url || pathname.startsWith(`${url}/`);

  const Component = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;

  // 🔥 PRÉ-CARREGAMENTO AO PASSAR O MOUSE (A página carrega antes do clique)
  const handleMouseEnter = () => {
    if (url !== "#") {
      router.prefetch(url);
    }
  };

  // 🔥 NAVEGAÇÃO NÃO-BLOQUEANTE (Impede o congelamento visual no clique)
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (url === "#") return;

    e.preventDefault();
    startTransition(() => {
      router.push(url);
    });
  };

  return (
    <Component
      asChild
      isActive={isActive}
      className={cn(
        "relative transition-all duration-200 group cursor-pointer overflow-hidden",
        "hover:bg-muted/50 hover:text-foreground text-muted-foreground",
        isPending && "opacity-70 animate-pulse",
        isActive &&
          "bg-gradient-to-r from-blue-600/20 via-blue-600/5 to-transparent text-blue-500 font-medium hover:bg-blue-600/20 hover:text-blue-400",
      )}
    >
      <Link
        href={url}
        prefetch={true}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        className="flex items-center gap-2 w-full"
      >
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

        {isActive && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-l-full bg-blue-500 shadow-[0_0_12px_2px_rgba(59,130,246,0.8)] animate-in fade-in slide-in-from-right-1 duration-300" />
        )}
      </Link>
    </Component>
  );
}
