import { columns, Order } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";

// Dados Fakes corrigidos para ter a estrutura "customer: { name, email }"
async function getData(): Promise<Order[]> {
  return [
    { 
      id: "1", 
      invoiceId: "#INV-1001", 
      customer: { name: "Ruan Amorim", email: "ruan@test.com" }, // ✅ Agora tem o objeto customer
      date: "Out 31, 2024", 
      dueDate: "Nov 14, 2024", 
      amount: 250, 
      status: "delivered" 
    },
    { 
      id: "2", 
      invoiceId: "#INV-1002", 
      customer: { name: "Sarah Lee", email: "sarah@ex.com" }, 
      date: "Nov 4, 2024", 
      dueDate: "Nov 19, 2024", 
      amount: 180, 
      status: "shipped" 
    },
    { 
      id: "3", 
      invoiceId: "#INV-1003", 
      customer: { name: "Adam Smith", email: "adam@ex.com" }, 
      date: "Nov 7, 2024", 
      dueDate: "Nov 21, 2024", 
      amount: 320, 
      status: "pending" 
    },
    { 
      id: "4", 
      invoiceId: "#INV-1004", 
      customer: { name: "Emma Brown", email: "emma@ex.com" }, 
      date: "Nov 9, 2024", 
      dueDate: "Nov 23, 2024", 
      amount: 420, 
      status: "in_transit" 
    },
    { 
      id: "5", 
      invoiceId: "#INV-1005", 
      customer: { name: "Michael Tan", email: "mic@ex.com" }, 
      date: "Nov 14, 2024", 
      dueDate: "Nov 29, 2024", 
      amount: 150, 
      status: "processing" 
    },
    { 
      id: "6", 
      invoiceId: "#INV-1006", 
      customer: { name: "Sophia White", email: "sophia@ex.com" }, 
      date: "Nov 1, 2024", 
      dueDate: "Nov 15, 2024", 
      amount: 275, 
      status: "failed" 
    },
  ];
}

export default async function OrdersPage() {
  const data = await getData();

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">
            Aqui está a lista de pedidos recentes da sua loja.
          </p>
        </div>
      </div>
      
      {/* Componente Genérico recebendo os dados corretos */}
      <DataTable columns={columns} data={data} />
    </div>
  );
}