"use client";

import { authClient } from "@/lib/auth-client"; // Certifique-se que o caminho está certo
import { useRouter } from "next/navigation";
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
  useSidebar, // Agora podemos usar isso!
} from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";

// 👇 1. CRIAMOS A TIPAGEM CORRETA AQUI
interface UserProps {
  user: {
    name: string;
    email: string;
    image?: string | null; // Pode vir null do banco
  };
}

// Recebemos o user via props, não buscamos mais ele aqui dentro
export function NavUser({ user }: UserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // Redireciona após sair
          router.refresh(); // Atualiza a página para limpar cache
        },
      },
    });
  };

  // Se não tiver usuário carregado ainda, não mostra nada (ou use um skeleton)
  if (!user) return null;

  // Função simples para pegar as iniciais (Ex: Ruan Amorim -> RA)
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

  // Função para alternar tema sem fechar o menu bruscamente
  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que o clique feche o menu imediatamente
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
                  <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold leading-none">
                    {user.plan || "PRO"}
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
                    <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold leading-none">
                      {user.plan || "PRO"}
                    </span>
                  </div>

                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* ITEM DE TEMA (CLARO/ESCURO) */}
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
                  className="scale-75" // Deixa o switch um pouco menor e mais elegante
                />
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <IconUserCircle />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/billing">
                  <IconCreditCard />
                  Cobrança
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/#">
                  <IconNotification />
                  Notificações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* AQUI ESTÁ A MÁGICA DO LOGOUT */}
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
