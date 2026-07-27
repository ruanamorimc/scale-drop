"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react"; // 🔥 Importamos o useTransition
import { ChevronsUpDown, Plus, Check, Loader2 } from "lucide-react"; // 🔥 Importamos o Loader2
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({ workspaces }: WorkspaceSwitcherProps) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  // 🔥 Inicia o hook de transição
  const [isPending, startTransition] = useTransition();

  const currentSlug = params.slug as string;

  const activeWorkspace =
    workspaces?.find((ws) => ws.slug === currentSlug) || workspaces?.[0];

  const handleSwitch = (newSlug: string) => {
    if (newSlug === currentSlug) return;

    // 🔥 Envolvemos o redirecionamento no startTransition
    startTransition(() => {
      if (currentSlug && pathname) {
        const newPath = pathname.replace(`/${currentSlug}`, `/${newSlug}`);
        router.push(newPath);
      } else {
        router.push(`/${newSlug}/dashboard`);
      }
    });
  };

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={isPending} // 🔥 Desabilita o botão enquanto carrega
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-muted transition-all p-2 h-auto"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-zinc-900 border border-border/50 shrink-0">
                <Image src="/logo.svg" alt="logo" width={22} height={22} />
              </div>

              <div className="flex flex-col gap-0.5 leading-none flex-1 text-left ml-1 truncate">
                <span className="font-semibold text-base text-foreground tracking-tight">
                  Scale Drop
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {activeWorkspace?.name}
                </span>
              </div>

              {/* 🔥 Se estiver carregando, mostra o spinner. Se não, mostra as setinhas */}
              {isPending ? (
                <Loader2 className="ml-auto h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
              ) : (
                <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Meus Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSwitch(workspace.slug)}
                disabled={isPending} // 🔥 Impede múltiplos cliques
                className="flex items-center justify-between cursor-pointer gap-2"
              >
                <span className="truncate">{workspace.name}</span>
                {workspace.id === activeWorkspace?.id && (
                  <Check size={14} className="text-emerald-500 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/create-workspace")}
              disabled={isPending}
              className="cursor-pointer text-blue-500 font-medium focus:text-blue-600 focus:bg-blue-500/10"
            >
              <Plus size={14} className="mr-2" />
              Criar novo workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
