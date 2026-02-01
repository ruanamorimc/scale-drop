import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/Index";
import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProviders";

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  // 🛑 O GUARDIÃO: Se não tiver sessão, o layout "morre" aqui.
  // Como o layout é interrompido, a Sidebar e o Header nem chegam a ser renderizados.
  if (!session) {
    unauthorized();
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar variant="floating" collapsible="icon" />
        <main className="w-full">
          <div className="px-4">{children}</div>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}
