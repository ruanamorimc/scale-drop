import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "@/app/(private)/orders/columns";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { getRecentOrders } from "@/actions/get-recent-orders"; // <--- Importe a Action

export async function RecentOrdersTable() {
  // Chamada ao Banco de Dados (Server Side)
  const data = await getRecentOrders();

  return (
    <PremiumCard className="overflow-hidden">
      <div className="p-6">
        {/* Header da Tabela */}
        <div className="flex flex-col space-y-1.5 mb-6">
          <h3 className="font-bold text-lg text-foreground leading-none">
            Pedidos Recentes
          </h3>
          <p className="text-xs text-muted-foreground">
            Gerencie as últimas transações da sua loja.
          </p>
        </div>

        {/* A Tabela */}
        <div className="rounded-md border border-white/5 bg-black/20">
          {/* Se não houver dados, o DataTable geralmente lida com isso ou mostra vazio */}
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </PremiumCard>
  );
}
