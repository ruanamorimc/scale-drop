import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/Index";
import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProviders";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default async function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  if (!session) {
    unauthorized();
  }
  const userEmail = session?.user?.email;

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

          {/* 🔥 O NOVO TOASTER CYBERPUNK/NEON! */}
          {/* 🔥 O NOVO TOASTER CYBERPUNK/NEON (COM UNSTYLED TRUE) */}
          <Toaster
            position="top-right"
            toastOptions={{
              unstyled: true, // 🔥 Isso desliga o CSS padrão teimoso dele!
              classNames: {
                toast:
                  "group flex w-[350px] flex-col gap-1.5 rounded-xl border border-white/10 bg-black/95 px-5 py-4 text-white shadow-[0_0_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all",
                title: "text-sm font-semibold tracking-tight",
                description: "text-xs text-zinc-400",
                actionButton:
                  "bg-white text-black font-medium hover:bg-zinc-200 mt-2 px-3 py-1.5 rounded-md",
                cancelButton:
                  "bg-zinc-800 text-white font-medium hover:bg-zinc-700 mt-2 px-3 py-1.5 rounded-md",
                success:
                  "border-l-4 border-l-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]",
                error:
                  "border-l-4 border-l-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
                warning:
                  "border-l-4 border-l-yellow-500 shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]",
                info: "border-l-4 border-l-blue-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]",
              },
            }}
          />
        </main>
      </SidebarProvider>
      <WhatsAppFloat userEmail={userEmail} />
    </ThemeProvider>
  );
}
