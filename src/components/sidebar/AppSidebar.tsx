import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

import { NavUser } from "@/components/sidebar/NavUser";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return null;

  // 🔥 BUSCA TODOS OS WORKSPACES DO USUÁRIO NO BANCO
  const rawWorkspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  // 🔥 BLINDAGEM: Limpamos os dados do Prisma, removendo as Datas para evitar falha no Client Component
  const safeWorkspaces = rawWorkspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
  }));

  // O fallback continua sendo o primeiro workspace da lista
  const fallbackSlug = safeWorkspaces.length > 0 ? safeWorkspaces[0].slug : "";

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center justify-between pt-4 pb-2 px-2">
        <div className="flex-1">
          {/* 🔥 Repassa os dados seguros */}
          <WorkspaceSwitcher workspaces={safeWorkspaces} />
        </div>
        <SidebarTrigger className="h-7 w-7 ml-1" />
      </SidebarHeader>

      <SidebarContent>
        <NavMain fallbackSlug={fallbackSlug} />
        <div className="mt-auto">
          <NavSecondary fallbackSlug={fallbackSlug} />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} fallbackSlug={fallbackSlug} />
      </SidebarFooter>
    </Sidebar>
  );
}
