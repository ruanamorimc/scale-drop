import { getServerSession } from "@/lib/get-session";
import { unauthorized } from "next/navigation";
import prisma from "@/lib/prisma"; // 🔥 Adicionamos o Prisma
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
  params, // 🔥 1. Recebemos os params para pegar o slug
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  // 🔥 2. Aguardamos e desempacotamos as Promises do Next.js 15
  const { slug } = await params;
  const query = await searchParams;

  // 🔥 3. Busca o Workspace atual (Igualzinho na tela de integrações)
  const currentWorkspace = await prisma.workspace.findUnique({
    where: { slug: slug },
  });

  if (!currentWorkspace) {
    return <div>Workspace não encontrado.</div>;
  }

  const workspaceId = currentWorkspace.id;

  let from: Date | undefined = undefined;
  let to: Date | undefined = undefined;

  if (typeof query.from === "string") {
    from = new Date(`${query.from}T00:00:00-03:00`);
  }

  if (typeof query.to === "string") {
    to = new Date(`${query.to}T23:59:59-03:00`);
  }

  // 🔥 4. PASSAMOS O WORKSPACE ID PARA A ACTION (Você precisará atualizar ela para receber esse parâmetro!)
  const financeData = await getFinanceMetrics(workspaceId, from, to);

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
          {/* 🔥 5. Passamos o Workspace ID para a Tabela renderizar só pedidos desta loja */}
          <RecentOrdersTable workspaceId={workspaceId} from={from} to={to} />
        </div>
      </main>
    </DashboardProvider>
  );
}
