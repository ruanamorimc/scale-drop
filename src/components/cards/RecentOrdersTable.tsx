import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "@/app/(private)/orders/columns";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { getRecentOrders } from "@/actions/get-recent-orders";

// 1. Adicionamos o productId na tipagem para repassar o filtro
interface RecentOrdersTableProps {
  from?: Date;
  to?: Date;
  productId?: string;
}

export async function RecentOrdersTable({
  from,
  to,
  productId,
}: RecentOrdersTableProps) {
  // 2. Repassamos o productId para a Action
  const data = await getRecentOrders(from, to, productId);

  return (
    <PremiumCard className="w-full overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col space-y-1.5 mb-6">
          <h3 className="font-bold text-lg text-foreground leading-none">
            Pedidos Recentes
          </h3>
          <p className="text-xs text-muted-foreground">
            Gerencie as últimas transações da sua loja.
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-md border border-white/5 bg-black/20">
          <div className="min-w-[900px]">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
