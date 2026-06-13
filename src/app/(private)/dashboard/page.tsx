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
import { DashboardProvider } from "@/components/dashboard/DashboardContext";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  // Aguarda os parâmetros da URL
  const params = await searchParams;

  let from: Date | undefined = undefined;
  let to: Date | undefined = undefined;

  if (typeof params.from === "string") {
    // Forçamos o fuso horário local (-03:00)
    from = new Date(`${params.from}T00:00:00-03:00`);
  }

  if (typeof params.to === "string") {
    // Forçamos o fuso horário local (-03:00)
    to = new Date(`${params.to}T23:59:59-03:00`);
  }

  const financeData = await getFinanceMetrics(from, to);

  // 🔥 TRUQUE SÊNIOR: Forçamos o TypeScript a entender o formato do safeData
  // baseando-se no retorno real da função getFinanceMetrics, eliminando o erro da linha 54 e sem usar "any".
  const safeData = financeData || ({} as NonNullable<typeof financeData>);

  return (
    <DashboardProvider>
      <main className="px-6 py-6 space-y-6 w-full min-w-0 overflow-x-hidden">
        <DashboardHeader data={safeData} />

        <SummaryCards data={safeData} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <ChartBarStacked data={safeData} />
            <CardMetrics data={safeData} />
          </div>

          <div className="xl:col-span-1 h-full">
            <TopProducts data={safeData} />
          </div>

          <div className="xl:col-span-3">
            <PaymentConversion data={safeData} />
          </div>
        </div>

        <div className="w-full overflow-hidden">
          {/* 🔥 Agora sim! Injetamos as datas na tabela de Pedidos Recentes */}
          <RecentOrdersTable from={from} to={to} />
        </div>
      </main>
    </DashboardProvider>
  );
}
