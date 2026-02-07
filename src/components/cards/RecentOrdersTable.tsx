import { DataTable } from "@/components/data-table/DataTable";
// 👇 AQUI ESTÁ O SEGREDO: Reutilizamos as colunas que você já definiu!
import { columns, Order } from "@/app/(private)/orders/columns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

// Copie sua função getData para cá (ou importe de um lugar comum depois)
async function getData(): Promise<Order[]> {
  // Retornando apenas 5 ou 6 itens para a Dashboard não ficar gigante
  return [
    {
      id: "1",
      invoiceId: "#INV-1001",
      customer: { name: "Ruan Amorim", email: "ruan@test.com" },
      date: "Out 31, 2024",
      time: "14:30",
      paymentStatus: "paid",
      paymentMethod: "Cartão de Crédito",
      amount: 250,
      status: "delivered", // Use STATUS.DELIVERED se tiver ajustado o enum
    },
    {
      id: "2",
      invoiceId: "#INV-1002",
      customer: { name: "Sarah Lee", email: "sarah@ex.com" },
      date: "Nov 4, 2024",
      time: "14:30",
      paymentStatus: "paid",
      paymentMethod: "Cartão de Crédito",
      amount: 180,
      status: "shipped",
    },
    {
      id: "3",
      invoiceId: "#INV-1003",
      customer: { name: "Adam Smith", email: "adam@ex.com" },
      date: "Nov 7, 2024",
      time: "14:30",
      paymentStatus: "paid",
      paymentMethod: "Cartão de Crédito",
      amount: 320,
      status: "pending",
    },
    {
      id: "4",
      invoiceId: "#INV-1004",
      customer: { name: "Emma Brown", email: "emma@ex.com" },
      date: "Nov 9, 2024",
      time: "14:30",
      paymentStatus: "paid",
      paymentMethod: "Cartão de Crédito",
      amount: 420,
      status: "in_transit",
    },
    {
      id: "5",
      invoiceId: "#INV-1005",
      customer: { name: "Michael Tan", email: "mic@ex.com" },
      date: "Nov 14, 2024",
      time: "14:30",
      paymentStatus: "paid",
      paymentMethod: "Cartão de Crédito",
      amount: 150,
      status: "processing",
    },
  ];
}

export async function RecentOrdersTable() {
  const data = await getData();

  return (
    <div className="space-y-4">
      {/* Cabeçalho Opcional igual da referência */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* A Tabela em si */}
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
