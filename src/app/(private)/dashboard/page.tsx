import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import { SectionCards } from "@/components/cards/SectionCards";
import { SummaryCards } from "@/components/cards/SummaryCards";
import { ChartBarStacked } from "@/components/cards/ChartsArea";
import { SideMetrics } from "@/components/cards/SideMetrics";
import { CardMetrics } from "@/components/cards/CardMetrics";
import { RecentOrdersTable } from "@/components/cards/RecentOrdersTable";
import { TopProducts } from "@/components/cards/TopProducts";

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  return (
    <main className="px-4 py-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mb-4">
            Bem-vindo(a) de volta! Aqui está o resumo da sua conta.
          </p>
        </div>
      </div>
      {/* 2. OS 4 CARDS DO TOPO */}
      <SummaryCards />

      {/* 3. O LAYOUT ASSIMÉTRICO (Igual Reportana) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Esquerda (Ocupa 3 colunas - 75%) */}
        <div className="lg:col-span-2 space-y-4">
          <ChartBarStacked />
          {/* 2. OS 6 CARDS DE BAIXO */}
          <CardMetrics />
        </div>

        {/* Direita (Ocupa 1 coluna - 25%) */}
        <div className="lg:col-span-1 space-y-4">
          <SideMetrics />
          <TopProducts />
        </div>
        <div className="lg:col-span-3 space-y-4 ">
          <RecentOrdersTable />
        </div>
      </div>
    </main>
  );
}
