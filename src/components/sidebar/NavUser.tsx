"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
// 🔥 Importamos o useParams junto com o useRouter
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";

interface UserProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    plan?: string;
  };
  fallbackSlug: string; // 🔥 Adiciona aqui na Interface
}

export function NavUser({ user, fallbackSlug }: UserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const params = useParams();
  const slug = (params.slug as string) || fallbackSlug;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "CN"
    );
  };

  const getPlanBadgeStyle = (planName: string) => {
    switch (planName.toUpperCase()) {
      case "START":
        return "bg-emerald-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold leading-none border-emerald-500/30";
      case "SCALE":
        return "bg-purple-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold leading-none border-purple-500/30";
      case "PRO":
        return "bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold leading-none";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{user.name}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                      getPlanBadgeStyle(user.plan || "START"),
                    )}
                  >
                    {user.plan || "START"}
                  </span>
                </div>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name}</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        getPlanBadgeStyle(user.plan || "START"),
                      )}
                    >
                      {user.plan || "START"}
                    </span>
                  </div>

                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-2 py-2 text-sm select-none">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Modo Escuro</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  className="scale-75"
                />
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                {/* 🔥 Adicionamos o slug aqui */}
                <Link href={`/${slug}/settings`}>
                  <IconUserCircle />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {/* 🔥 E aqui também */}
                <Link href={`/${slug}/settings/billing`}>
                  <IconCreditCard />
                  Cobrança
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <IconNotification />
                  Notificações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
