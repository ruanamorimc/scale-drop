import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import { SummaryCards } from "@/components/cards/SummaryCards";
import { ChartBarStacked } from "@/components/cards/ChartsArea";
import { CardMetrics } from "@/components/cards/CardMetrics";
import { PaymentConversion } from "@/components/cards/PaymentConversion";
import { RecentOrdersTable } from "@/components/cards/RecentOrdersTable";
import { TopProducts } from "@/components/cards/TopProducts";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getFinanceMetrics } from "@/actions/finance-overview";
// IMPORTANTE: Importar o Provider
import { DashboardProvider } from "@/components/dashboard/DashboardContext";

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  const financeData = await getFinanceMetrics();
  const safeData = financeData || {};

  return (
    // 1. Envolver tudo no Provider
    <DashboardProvider>
      <main className="px-6 py-6 space-y-6">
        {/* 2. Passar 'data' para o Header (para Exportar CSV) */}
        <DashboardHeader data={safeData} />

        <SummaryCards data={safeData} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <ChartBarStacked data={safeData.chartData} />
            <CardMetrics data={safeData} />
          </div>

          <div className="xl:col-span-1 h-full">
            <TopProducts data={safeData} />
          </div>

          <div className="xl:col-span-3">
            <PaymentConversion data={safeData} />
          </div>
        </div>

        <div className="w-full">
          <RecentOrdersTable />
        </div>
      </main>
    </DashboardProvider>
  );
}
