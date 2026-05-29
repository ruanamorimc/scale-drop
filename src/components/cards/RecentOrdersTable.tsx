import { DataTable } from "@/components/data-table/DataTable";
import { columns } from "@/app/(private)/orders/columns";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { getRecentOrders } from "@/actions/get-recent-orders";

export async function RecentOrdersTable() {
  // Chamada ao Banco de Dados (Server Side)
  const data = await getRecentOrders();

  return (
    // 1. Adicionado w-full aqui para garantir que o card respeite o limite da tela
    <PremiumCard className="w-full overflow-hidden">
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

        {/* 2. O SEGREDO DO SCROLL: Container com w-full e overflow-x-auto */}
        <div className="w-full overflow-x-auto rounded-md border border-white/5 bg-black/20">
          {/* 3. min-w garante que a tabela não esmague no mobile, ativando o scroll do container pai */}
          <div className="min-w-[900px]">
            <DataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}