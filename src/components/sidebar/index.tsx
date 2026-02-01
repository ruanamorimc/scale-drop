import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getServerSession } from "@/lib/get-session";
import Image from "next/image";
import Link from "next/link";

import { NavUser } from "@/components/sidebar/NavUser";
import { NavMain } from "./NavMain";
import { NavSecondary } from "./NavSecondary";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Image src="logo.svg" alt="logo" width={20} height={20} />
                <span className="text-base font-semibold">Scale Drop</span>
              </Link>
            </SidebarMenuButton>
            <SidebarTrigger className="items-center mt-2" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/**Conteúdo da Sidebar */}
        <NavMain />
        <div className="mt-auto">
          <NavSecondary />
        </div>
      </SidebarContent>
      <SidebarFooter>
        {/**Conteúdo da Usuario */}
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
