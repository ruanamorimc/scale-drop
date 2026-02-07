"use client";

import { columns, Order } from "./columns";
import { DataTable } from "@/components/data-table/DataTable";
import { OrderDetails } from "@/components/orders/OrderDetails"; // Importe o novo componente
import { useState, useEffect } from "react";

// DADOS MOCK (Pode manter o seu getData, apenas movi para cá para facilitar o exemplo completo)
const MOCK_DATA: Order[] = [
  {
    id: "1",
    invoiceId: "#INV-1001",
    customer: { name: "Ruan Amorim", email: "ruan@test.com", avatar: "" },
    date: "Out 21, 2024",
    time: "14:30",
    paymentStatus: "paid",
    paymentMethod: "Cartão de Crédito",
    amount: 250,
    status: "delivered",
    items: [
      {
        name: "Mouse Logitech MX Master 3",
        price: 250.0,
        quantity: 1,
        image:
          "https://resource.logitech.com/w_692,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png?v=1",
      },
    ],
  },
  {
    id: "2",
    invoiceId: "#INV-8923",
    customer: { name: "Daniel", email: "daniel@test.com", avatar: "" },
    date: "Out 31, 2024",
    time: "14:30",
    paymentStatus: "paid",
    paymentMethod: "Cartão de Crédito",
    amount: 99,
    status: "pending",
    items: [],
  },
  // ... Adicione mais dados se quiser
];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>(MOCK_DATA);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    // Container Principal: Ocupa toda a altura disponível e usa Flex para dividir colunas
    <div className="flex h-full w-full overflow-hidden">
      {/* COLUNA ESQUERDA (TABELA) */}
      {/* flex-1 faz ela ocupar todo o espaço. Se abrir o detalhe, ela encolhe. */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-8 space-y-8 min-w-[500px] transition-all duration-300">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pedidos</h2>
            <p className="text-muted-foreground">
              Aqui está a lista de pedidos recentes da sua loja.
            </p>
          </div>
        </div>

        {/* A tabela agora tem scroll próprio dentro desse container */}
        <div className="flex-1 overflow-auto pr-2">
          <DataTable
            columns={columns}
            data={data}
            onRowClick={(row) => setSelectedOrder(row)}
          />
        </div>
      </div>

      {/* COLUNA DIREITA (DETALHES) */}
      {/* Só renderiza se tiver um pedido selecionado */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
