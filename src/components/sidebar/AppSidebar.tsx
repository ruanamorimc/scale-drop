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

  // 🔥 BUSCA WORKSPACES, PLANO E ROLE DO USUÁRIO NO BANCO
  const [rawWorkspaces, dbUser] = await Promise.all([
    prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, role: true },
    }),
  ]);

  const safeWorkspaces = rawWorkspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
  }));

  const fallbackSlug = safeWorkspaces.length > 0 ? safeWorkspaces[0].slug : "";

  // 🔥 PRIORIDADE: Se a role for ADMIN, exibe ADMIN. Caso contrário, exibe o plano (START, SCALE, PRO)
  const displayBadge =
    dbUser?.role?.toUpperCase() === "ADMIN"
      ? "ADMIN"
      : dbUser?.plan?.toUpperCase() || "START";

  const userWithPlan = {
    ...user,
    plan: displayBadge,
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center justify-between pt-4 pb-2 px-2">
        <div className="flex-1">
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
        <NavUser user={userWithPlan} fallbackSlug={fallbackSlug} />
      </SidebarFooter>
    </Sidebar>
  );
}
